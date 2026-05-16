'use client';

import { motion } from 'framer-motion';
import { FaceScore } from '@/lib/faceAnalysis';
import { ScanFace, CheckCircle, AlertCircle } from 'lucide-react';

interface VideoPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  label: string;
  score: FaceScore | null;
  isLocal: boolean;
  faceDetected: boolean | null;
  color: 'cyan' | 'pink';
}

const SCORE_BARS = [
  { key: 'symmetry', label: 'Symmetry' },
  { key: 'eyeScore', label: 'Eye Score' },
  { key: 'jawScore', label: 'Jaw' },
  { key: 'harmony',  label: 'Harmony' },
];

export default function VideoPanel({ videoRef, label, score, isLocal, faceDetected, color }: VideoPanelProps) {
  const hex     = color === 'cyan' ? '#00f5d4' : '#ff2d78';
  const rgba    = color === 'cyan' ? 'rgba(0,245,212,0.35)' : 'rgba(255,45,120,0.35)';
  const shadow  = color === 'cyan'
    ? '0 0 24px rgba(0,245,212,0.18), inset 0 0 24px rgba(0,245,212,0.04)'
    : '0 0 24px rgba(255,45,120,0.18), inset 0 0 24px rgba(255,45,120,0.04)';

  return (
    <div
      className="card"
      style={{
        borderColor: rgba,
        boxShadow: shadow,
        overflow: 'hidden',
        borderRadius: 20,
        padding: 0,
      }}
    >
      {/* Video */}
      <div className="video-panel">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isLocal ? 'scaleX(-1)' : 'none',
            display: 'block',
          }}
        />

        {/* Scanline */}
        <div className="scanline" />

        {/* Corner brackets */}
        {[
          { cls: 'corner-tl', bt: `2px solid ${hex}`, bl: `2px solid ${hex}`, bb: 'none', br: 'none' },
          { cls: 'corner-tr', bt: `2px solid ${hex}`, br: `2px solid ${hex}`, bb: 'none', bl: 'none' },
          { cls: 'corner-bl', bb: `2px solid ${hex}`, bl: `2px solid ${hex}`, bt: 'none', br: 'none' },
          { cls: 'corner-br', bb: `2px solid ${hex}`, br: `2px solid ${hex}`, bt: 'none', bl: 'none' },
        ].map(c => (
          <div
            key={c.cls}
            className={`corner ${c.cls}`}
            style={{ borderTop: c.bt, borderBottom: c.bb, borderLeft: c.bl, borderRight: c.br }}
          />
        ))}

        {/* Label top-right */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span
            className="font-display"
            style={{ fontSize: 20, color: hex, textShadow: `0 0 16px ${hex}` }}
          >
            {label}
          </span>
        </div>

        {/* Face detection chip */}
        {faceDetected !== null && (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)' }}>
            <motion.div
              className="card flex items-center gap-2"
              style={{ padding: '5px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}
              animate={{ opacity: faceDetected ? 1 : 0.5 }}
            >
              {faceDetected
                ? <CheckCircle size={12} color="#4ade80" />
                : <AlertCircle size={12} color="#f87171" />
              }
              <span style={{ color: faceDetected ? '#4ade80' : '#f87171' }}>
                {faceDetected ? 'FACE LOCKED' : 'NO FACE'}
              </span>
            </motion.div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="video-panel-overlay" />

        {/* Live score overlay */}
        {score && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              padding: '12px 14px',
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="font-display text-center"
              style={{ fontSize: 44, color: hex, textShadow: `0 0 30px ${hex}80`, marginBottom: 8 }}
            >
              {score.total.toFixed(1)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {SCORE_BARS.map(b => (
                <div key={b.key} className="flex items-center gap-2">
                  <span className="text-muted text-xs" style={{ width: 60 }}>{b.label}</span>
                  <div className="score-bar flex-1">
                    <motion.div
                      className="score-bar-fill"
                      style={{ background: `linear-gradient(90deg, ${hex}66, ${hex})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((score as any)[b.key] || 0) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom no-score placeholder */}
      {!score && (
        <div
          className="flex items-center justify-center gap-2"
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid var(--clr-border)',
          }}
        >
          <ScanFace size={14} color="var(--clr-text-3)" />
          <span className="text-muted text-xs">Waiting for analysis…</span>
        </div>
      )}
    </div>
  );
}
