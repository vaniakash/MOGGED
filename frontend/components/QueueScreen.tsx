'use client';

import { motion } from 'framer-motion';
import { Target, X, Lightbulb, Users } from 'lucide-react';

interface QueueScreenProps {
  position: number;
  onCancel: () => void;
}

export default function QueueScreen({ position, onCancel }: QueueScreenProps) {
  return (
    <div className="text-center container-sm" style={{ margin: '0 auto', padding: '0 16px' }}>

      {/* Radar animation */}
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 28px' }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1.5px solid rgba(0,245,212,0.3)',
            }}
            animate={{ scale: [1, 3], opacity: [0.7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
          />
        ))}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,245,212,0.15), rgba(168,85,247,0.1))',
          border: '2px solid rgba(0,245,212,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Target size={44} color="#00f5d4" strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>

      {/* ── WAITING FOR OPPONENT — the main message ── */}
      <motion.div
        className="font-display"
        style={{
          fontSize: 'clamp(32px, 7vw, 54px)',
          letterSpacing: '0.06em',
          lineHeight: 1.1,
          marginBottom: 10,
          background: 'linear-gradient(135deg, #00f5d4, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        WAITING FOR<br />OPPONENT
      </motion.div>

      {/* Pulse dots */}
      <div className="flex items-center justify-center gap-3" style={{ marginBottom: 12 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#00f5d4' }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>

      {/* Position in queue */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <Users size={14} color="#a855f7" />
        <p className="text-secondary" style={{ fontSize: 13 }}>
          {position > 1
            ? `${position - 1} player${position - 1 > 1 ? 's' : ''} ahead of you`
            : position === 1
              ? "You're next — opponent found any second now!"
              : 'Searching the arena…'
          }
        </p>
      </div>

      {/* Tips card */}
      <div className="card mb-8" style={{ padding: '14px 20px', textAlign: 'left' }}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={13} color="#fbbf24" />
          <span className="text-muted text-xs font-semibold uppercase tracking-widest">Prep while you wait</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            '💡 Good lighting = higher score',
            '📷 Center your face in the frame',
            '👀 Look directly at the camera',
            '🧘 Relax your jaw — it improves landmark accuracy',
          ].map(tip => (
            <p key={tip} className="text-secondary text-sm">{tip}</p>
          ))}
        </div>
      </div>

      <button id="cancel-queue-btn" className="btn btn-ghost" onClick={onCancel}>
        <X size={15} /> Cancel
      </button>
    </div>
  );
}
