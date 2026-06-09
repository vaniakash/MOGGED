'use client';

import { motion } from 'framer-motion';
import { X, Lightbulb, Users, Loader2 } from 'lucide-react';

interface QueueScreenProps {
  position: number;
  onCancel: () => void;
}

export default function QueueScreen({ position, onCancel }: QueueScreenProps) {
  return (
    <div className="text-center container-sm" style={{ margin: '0 auto', padding: '0 16px' }}>

      {/* Simple spinner instead of neon radar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={40} color="#f8fafc" />
        </motion.div>
      </div>

      {/* ── WAITING FOR OPPONENT ── */}
      <motion.h2
        style={{
          fontSize: 'clamp(28px, 6vw, 42px)',
          fontWeight: 700,
          color: '#f8fafc',
          letterSpacing: '0.05em',
          lineHeight: 1.1,
          marginBottom: 12,
        }}
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        WAITING FOR<br />OPPONENT
      </motion.h2>

      {/* Pulse dots */}
      <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>

      {/* Position in queue */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <Users size={16} color="#64748b" />
        <p style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
          {position > 1
            ? `${position - 1} player${position - 1 > 1 ? 's' : ''} ahead of you`
            : position === 1
              ? "You're next — opponent found any second now!"
              : 'Searching the arena...'
          }
        </p>
      </div>

      {/* Tips card - Minimalist */}
      <div style={{ padding: 20, borderRadius: 12, background: '#0f1115', border: '1px solid #1e222a', textAlign: 'left', marginBottom: 32 }}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={14} color="#f8fafc" />
          <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prep while you wait</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'Good lighting = higher score',
            'Center your face in the frame',
            'Look directly at the camera',
            'Relax your jaw — it improves landmark accuracy',
          ].map(tip => (
            <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>•</span>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.4 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <button style={{ background: '#181b21', color: '#f8fafc', border: '1px solid #2a2f3a', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }} onClick={onCancel}>
        <X size={16} /> Cancel
      </button>
    </div>
  );
}
