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
};

// Free TURN servers (OpenRelay) + multiple STUN servers for maximum connectivity
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
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
  // Buffer signals that arrive BEFORE peer is ready
  const signalBuffer    = useRef<unknown[]>([]);
  const peerReadyRef    = useRef(false);

  const cleanup = useCallback(() => {
    try { peerRef.current?.destroy(); } catch {}
    peerRef.current = null;
    peerReadyRef.current = false;
    signalBuffer.current = [];
    setConnected(false);
    setRemoteStream(null);
  }, []);

  const initPeer = useCallback(async () => {
    if (!socket || !roomId || !role) return;

    // ── Step 1: Register signal buffer BEFORE any async work ─────────────
    // This ensures no signals are lost while camera/peer is initializing
    signalBuffer.current = [];
    peerReadyRef.current = false;

    const handleSignal = ({ signal }: { signal: unknown }) => {
      if (peerReadyRef.current && peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(signal);
      } else {
        // Buffer it — peer isn't ready yet
        signalBuffer.current.push(signal);
      }
    };

    socket.off('webrtc_signal'); // remove stale listeners
    socket.on('webrtc_signal', handleSignal);

    // ── Step 2: Get camera ────────────────────────────────────────────────
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.error('[WebRTC] Camera/mic access denied', err);
      socket.off('webrtc_signal', handleSignal);
      return;
    }
    setLocalStream(stream);

    // Destroy old peer
    try { peerRef.current?.destroy(); } catch {}

    // ── Step 3: Import + create peer ─────────────────────────────────────
    const SimplePeer = (await import('simple-peer')).default;

    const peer = new SimplePeer({
      initiator: role === 'initiator',
      trickle: true,
      stream,
      config: { iceServers: ICE_SERVERS },
    }) as PeerInstance;

    peerRef.current = peer;

    peer.on('signal', (signal: unknown) => {
      socket.emit('webrtc_signal', { roomId, signal });
    });

    peer.on('stream', (remoteStr: MediaStream) => {
      console.log('[WebRTC] ✅ Remote stream received');
      setRemoteStream(remoteStr);
      setConnected(true);
    });

    peer.on('connect', () => {
      console.log('[WebRTC] ✅ Peer data channel connected');
      setConnected(true);
    });

    peer.on('close', () => { setConnected(false); cleanup(); });
    peer.on('error', (e: Error) => {
      console.warn('[WebRTC] Peer error:', e.message);
    });

    // ── Step 4: Flush buffered signals ────────────────────────────────────
    peerReadyRef.current = true;
    const buffered = [...signalBuffer.current];
    signalBuffer.current = [];
    buffered.forEach(sig => {
      if (!peer.destroyed) peer.signal(sig);
    });
    console.log(`[WebRTC] Peer ready (${role}), flushed ${buffered.length} buffered signals`);

    return () => {
      socket.off('webrtc_signal', handleSignal);
    };
  }, [socket, roomId, role, cleanup]);

  useEffect(() => {
    if (socket && roomId && role) {
      const cleanupFn = initPeer();
      return () => {
        cleanupFn?.then(fn => fn?.());
        cleanup();
      };
    }
  }, [socket, roomId, role, initPeer, cleanup]);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      cleanup();
    };
  }, [localStream, cleanup]);

  return { localStream, remoteStream, connected, cleanup };
}
