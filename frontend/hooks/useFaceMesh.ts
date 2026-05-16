'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { analyzeFace, FaceScore } from '@/lib/faceAnalysis';

type InitState = 'idle' | 'loading' | 'ready' | 'error';

// MediaPipe landmark type (478 points with iris, same structure as old FaceMesh)
type Landmark = { x: number; y: number; z: number };

export function useFaceMesh(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [score, setScore]               = useState<FaceScore | null>(null);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [initState, setInitState]       = useState<InitState>('idle');

  const landmarkerRef = useRef<any>(null);
  const animFrameRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestScore   = useRef<FaceScore | null>(null);
  const runningRef    = useRef(false);
  const lastTime      = useRef(-1);

  // ── Pre-load using new @mediapipe/tasks-vision API ─────────────────────
  // This works WITHOUT SharedArrayBuffer / SIMD / cross-origin isolation
  const preInit = useCallback(async () => {
    if (landmarkerRef.current || initState === 'loading' || initState === 'ready') return;
    setInitState('loading');

    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      console.log('[FaceLandmarker] Loading WASM assets…');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      landmarkerRef.current = landmarker;
      setInitState('ready');
      console.log('[FaceLandmarker] ✅ Ready!');
    } catch (e) {
      console.error('[FaceLandmarker] init failed:', e);
      // Retry with CPU delegate if GPU failed
      try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        landmarkerRef.current = landmarker;
        setInitState('ready');
        console.log('[FaceLandmarker] ✅ Ready (CPU fallback)');
      } catch (e2) {
        console.error('[FaceLandmarker] CPU fallback also failed:', e2);
        setInitState('error');
      }
    }
  }, [initState]);

  // ── Start the analysis loop ─────────────────────────────────────────────
  const startAnalysis = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsAnalyzing(true);

    if (!landmarkerRef.current) {
      await preInit();
    }

    if (!landmarkerRef.current) {
      console.error('[FaceLandmarker] Not ready — cannot analyze');
      runningRef.current = false;
      setIsAnalyzing(false);
      return;
    }

    const loop = () => {
      if (!runningRef.current) return;

      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        const now = performance.now();
        if (now !== lastTime.current) {
          try {
            // Next.js dev server catches WASM stderr as an error overlay. 
            // TFLite logs "INFO: Created TensorFlow Lite XNNPACK delegate for CPU" on first inference.
            const origLog = console.log;
            const origWarn = console.warn;
            const origInfo = console.info;
            const origError = console.error;

            const silencer = (...args: any[]) => {
              if (typeof args[0] === 'string' && (args[0].includes('XNNPACK delegate') || args[0].includes('OpenGL error checking') || args[0].includes('INFO:'))) return;
              origLog(...args); // Fallback to log for unmatched
            };

            console.log = silencer;
            console.warn = silencer;
            console.info = silencer;
            console.error = (...args: any[]) => {
              if (typeof args[0] === 'string' && (args[0].includes('XNNPACK delegate') || args[0].includes('OpenGL error checking') || args[0].includes('INFO:'))) return;
              origError(...args);
            };

            const result = landmarkerRef.current.detectForVideo(video, now);
            
            console.log = origLog;
            console.warn = origWarn;
            console.info = origInfo;
            console.error = origError;
            if (result.faceLandmarks && result.faceLandmarks.length > 0) {
              setFaceDetected(true);
              const landmarks = result.faceLandmarks[0] as Landmark[];
              const computed  = analyzeFace(landmarks as any);
              latestScore.current = computed;
              setScore(computed);
            } else {
              setFaceDetected(false);
            }
            lastTime.current = now;
          } catch (e) {
            // swallow transient errors
          }
        }
      }

      if (runningRef.current) {
        // ~15 fps — enough for face analysis, saves mobile CPU
        animFrameRef.current = setTimeout(() => {
          requestAnimationFrame(loop);
        }, 66);
      }
    };

    loop();
  }, [videoRef, preInit]);

  const stopAnalysis = useCallback(() => {
    runningRef.current = false;
    setIsAnalyzing(false);
    if (animFrameRef.current) {
      clearTimeout(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const getFinalScore = useCallback(() => latestScore.current, []);

  useEffect(() => {
    return () => {
      stopAnalysis();
      try { 
        const origLog = console.log;
        const origWarn = console.warn;
        const origInfo = console.info;
        const origError = console.error;

        const silencer = (...args: any[]) => {
          if (typeof args[0] === 'string' && (args[0].includes('XNNPACK delegate') || args[0].includes('OpenGL error checking') || args[0].includes('INFO:'))) return;
          origLog(...args); 
        };

        console.log = silencer;
        console.warn = silencer;
        console.info = silencer;
        console.error = (...args: any[]) => {
          if (typeof args[0] === 'string' && (args[0].includes('XNNPACK delegate') || args[0].includes('OpenGL error checking') || args[0].includes('INFO:'))) return;
          origError(...args);
        };

        landmarkerRef.current?.close(); 

        console.log = origLog;
        console.warn = origWarn;
        console.info = origInfo;
        console.error = origError;
      } catch {}
    };
  }, [stopAnalysis]);

  return { score, isAnalyzing, faceDetected, initState, startAnalysis, stopAnalysis, preInit, getFinalScore };
}
