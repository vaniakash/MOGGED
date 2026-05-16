'use client';

import { motion } from 'framer-motion';
import { FaceScore } from '@/lib/faceAnalysis';
import { Lock, Activity } from 'lucide-react';

interface AnalyzingOverlayProps {
  countdown: number;
  score: FaceScore | null;
  onForceSubmit: () => void;
}

const METRICS = [
  { key: 'symmetry', label: 'Symmetry', color: '#00f5d4' },
  { key: 'eyeScore', label: 'Eye Score', color: '#a855f7' },
  { key: 'jawScore', label: 'Jaw',       color: '#fbbf24' },
  { key: 'harmony',  label: 'Harmony',   color: '#ff2d78' },
];

export default function AnalyzingOverlay({ countdown, score, onForceSubmit }: AnalyzingOverlayProps) {
  const urgent = countdown <= 3;

  return (
    <motion.div
      className="card"
      style={{
        padding: 24,
        borderColor: urgent ? 'rgba(255,45,120,0.5)' : 'rgba(0,245,212,0.3)',
        boxShadow: urgent ? '0 0 32px rgba(255,45,120,0.18)' : '0 0 32px rgba(0,245,212,0.12)',
        borderRadius: 20,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={16} color="#00f5d4" />
            <h3 className="font-display neon-cyan" style={{ fontSize: 22 }}>AI ANALYZING YOUR FACE</h3>
          </div>
          <p className="text-secondary" style={{ fontSize: 13 }}>Keep still and look at the camera</p>
        </div>
        <motion.div
          className="font-display"
          style={{ fontSize: 56, color: urgent ? '#ff2d78' : '#00f5d4', lineHeight: 1 }}
          animate={urgent ? {
            scale: [1, 1.18, 1],
            textShadow: [
              '0 0 20px rgba(255,45,120,0.8)',
              '0 0 48px rgba(255,45,120,1)',
              '0 0 20px rgba(255,45,120,0.8)',
            ],
          } : {}}
          transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
        >
          {countdown}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="score-bar mb-5" style={{ height: 8 }}>
        <motion.div
          className="score-bar-fill"
          style={{
            background: 'linear-gradient(90deg, #a855f7, #00f5d4)',
            width: `${((10 - countdown) / 10) * 100}%`,
          }}
        />
      </div>

      {/* Live metrics grid */}
      {score && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {METRICS.map(m => (
            <div
              key={m.key}
              className="card text-center"
              style={{ padding: '10px 6px', borderRadius: 12 }}
            >
              <div
                className="font-display"
                style={{ fontSize: 24, color: m.color, textShadow: `0 0 12px ${m.color}80` }}
              >
                {((score as any)[m.key] * 10).toFixed(1)}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trait badges */}
      {score?.traits && score.traits.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {score.traits.map(t => (
            <span key={t} className="badge">{t}</span>
          ))}
        </motion.div>
      )}

      <button
        id="force-submit-score-btn"
        className="btn btn-primary w-full"
        style={{ width: '100%', borderRadius: 14, fontFamily: 'var(--font-display)', letterSpacing: '0.12em', fontSize: 17 }}
        onClick={onForceSubmit}
      >
        <Lock size={16} strokeWidth={2.5} />
        LOCK IN SCORE NOW
      </button>
    </motion.div>
  );
}
