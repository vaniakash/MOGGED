'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface UseWebRTCOptions {
  socket: Socket | null;
  roomId: string | null;
  role: 'initiator' | 'receiver' | null;
}

type PeerInstance = {
  signal: (data: unknown) => void;
  destroy: (err?: Error) => void;
  destroyed: boolean;
  on: (event: string, cb: (...args: any[]) => void) => void;
  // simple-peer exposes the underlying RTCPeerConnection as _pc
  _pc?: RTCPeerConnection;
};

// Comprehensive ICE servers — multiple STUN + multiple TURN ports/protocols
const ICE_SERVERS: RTCIceServer[] = [
  // STUN — multiple for redundancy
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  // OpenRelay TURN — UDP (fastest, try first)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  // OpenRelay TURN — TCP (bypasses UDP-blocking firewalls)
  {
    urls: 'turn:openrelay.metered.ca:80?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  // OpenRelay TURN — port 443 (often allowed through corporate firewalls)
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  // OpenRelay TURN — port 443 TCP (most permissive, works behind HTTPS proxies)
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

export function useWebRTC({ socket, roomId, role }: UseWebRTCOptions) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null);
  const [connected,    setConnected]    = useState(false);

  const peerRef         = useRef<PeerInstance | null>(null);
  const signalBuffer    = useRef<unknown[]>([]);
  const peerReadyRef    = useRef(false);
  const retryTimerRef   = useRef<NodeJS.Timeout | null>(null);
  const gotStreamRef    = useRef(false);
  const localStreamRef  = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    try { peerRef.current?.destroy(); } catch {}
    peerRef.current = null;
    peerReadyRef.current = false;
    signalBuffer.current = [];
    gotStreamRef.current = false;
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    setConnected(false);
    setRemoteStream(null);
  }, []);

  const initPeer = useCallback(async (retryCount = 0) => {
    if (!socket || !roomId || !role) return;

    // Step 1: Register signal buffer BEFORE any async work to prevent signal loss
    signalBuffer.current = [];
    peerReadyRef.current = false;

    const handleSignal = ({ signal }: { signal: unknown }) => {
      if (peerReadyRef.current && peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(signal);
      } else {
        signalBuffer.current.push(signal);
      }
    };

    socket.off('webrtc_signal');
    socket.on('webrtc_signal', handleSignal);

    // Step 2: Get camera (reuse existing stream if available on retry)
    let stream: MediaStream;
    if (localStreamRef.current && localStreamRef.current.active) {
      stream = localStreamRef.current;
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        console.error('[WebRTC] Camera/mic access denied', err);
        socket.off('webrtc_signal', handleSignal);
        return;
      }
    }

    // Destroy old peer
    try { peerRef.current?.destroy(); } catch {}
    gotStreamRef.current = false;

    // Step 3: Create peer
    const SimplePeer = (await import('simple-peer')).default;

    const peer = new SimplePeer({
      initiator: role === 'initiator',
      trickle: true,
      stream,
      config: {
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,  // pre-gather candidates for faster connection
      },
    }) as PeerInstance;

    peerRef.current = peer;

    peer.on('signal', (signal: unknown) => {
      socket.emit('webrtc_signal', { roomId, signal });
    });

    peer.on('stream', (remoteStr: MediaStream) => {
      console.log(`[WebRTC] ✅ Remote stream received (attempt ${retryCount + 1})`);
      gotStreamRef.current = true;
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      setRemoteStream(remoteStr);
      setConnected(true);
    });

    peer.on('connect', () => {
      console.log('[WebRTC] ✅ Data channel connected');
      setConnected(true);
    });

    peer.on('close', () => { setConnected(false); });

    peer.on('error', (e: Error) => {
      console.warn('[WebRTC] Peer error:', e.message);
      // ICE failure — auto-retry once after 2s (only initiator retries to avoid double-init)
      if (role === 'initiator' && !gotStreamRef.current && retryCount < 2) {
        console.log(`[WebRTC] ICE failed, retrying (attempt ${retryCount + 2})...`);
        retryTimerRef.current = setTimeout(() => {
          if (!gotStreamRef.current) initPeer(retryCount + 1);
        }, 2000);
      }
    });

    // Step 4: Monitor ICE connection state via underlying RTCPeerConnection
    // simple-peer exposes it as `_pc`
    const pc = (peer as PeerInstance)._pc;
    if (pc) {
      pc.oniceconnectionstatechange = () => {
        console.log('[WebRTC] ICE state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed' && !gotStreamRef.current && retryCount < 2) {
          console.log('[WebRTC] ICE state=failed, scheduling retry...');
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            if (!gotStreamRef.current) initPeer(retryCount + 1);
          }, 1000);
        }
      };
    }

    // Step 5: Flush buffered signals
    peerReadyRef.current = true;
    const buffered = [...signalBuffer.current];
    signalBuffer.current = [];
    buffered.forEach(sig => { if (!peer.destroyed) peer.signal(sig); });
    console.log(`[WebRTC] Peer ready (${role}), flushed ${buffered.length} buffered signals`);

    return () => {
      socket.off('webrtc_signal', handleSignal);
    };
  }, [socket, roomId, role, cleanup]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (socket && roomId && role) {
      const cleanupFn = initPeer(0);
      return () => {
        cleanupFn?.then(fn => fn?.());
        cleanup();
      };
    }
  }, [socket, roomId, role, initPeer, cleanup]);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      cleanup();
    };
  }, [cleanup]);

  return { localStream, remoteStream, connected, cleanup };
}
