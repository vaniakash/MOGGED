'use client';
import AuthGuard from '@/components/AuthGuard';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RefreshCcw, Crosshair, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function AsyncDuelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const handleDuel = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const sessionId = localStorage.getItem('omogl_session') || 'demo-session';
      const formData = new FormData();
      formData.append('selfie', file);
      formData.append('sessionId', sessionId);

      const res = await fetch(`${BACKEND_URL}/api/duel/async`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Duel failed');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: '#050508', color: '#f8fafc', padding: '40px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        <Link href="/tools" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#64748b', fontSize: 13, fontWeight: 600,
          textDecoration: 'none', marginBottom: 32,
        }}>
          ← Back to Tools Hub
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Crosshair size={48} color="#f87171" />
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, marginBottom: 8 }}>Duel The Leaderboard</h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Upload a selfie to face off against a random player's snapshot for ELO points.</p>
        </div>

        {!result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 400, margin: '0 auto' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#0f1115', border: '2px dashed #1e222a', borderRadius: 16,
                padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#1e222a'}
            >
              {previewUrl ? (
                <img src={previewUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
              ) : null}
              
              <div style={{ position: 'relative', zIndex: 10 }}>
                <Camera size={40} color={previewUrl ? '#fff' : '#64748b'} style={{ marginBottom: 16 }} />
                <div style={{ color: '#f8fafc', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {previewUrl ? 'Change Photo' : 'Upload Selfie'}
                </div>
                <div style={{ color: '#64748b', fontSize: 12 }}>JPEG or PNG, up to 10MB</div>
              </div>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {error && <div style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>⚠️ {error}</div>}

            <button
              onClick={handleDuel}
              disabled={!file || loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none', marginTop: 24,
                background: !file ? '#1e222a' : loading ? 'rgba(248,113,113,0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: !file ? '#64748b' : '#fff', fontWeight: 700, fontSize: 16,
                cursor: !file || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Finding opponent...</> : 'Enter Duel'}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            
            {/* Duel Result Card */}
            <div style={{ background: '#0f1115', borderRadius: 16, border: '1px solid #1e222a', overflow: 'hidden', padding: 24, textAlign: 'center' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>You</div>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, lineHeight: 1, color: result.winner === 'user' ? '#4ade80' : '#f87171' }}>
                    {result.userScore}<span style={{ fontSize: 24, color: '#64748b' }}>/10</span>
                  </div>
                </div>
                
                <div style={{ flex: '0 0 auto', padding: '0 16px' }}>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 32, color: '#64748b' }}>VS</div>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{result.opponent.displayName}</div>
                  <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, lineHeight: 1, color: result.winner === 'opponent' ? '#4ade80' : '#f87171' }}>
                    {result.opponentScore}<span style={{ fontSize: 24, color: '#64748b' }}>/10</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                  {result.winner === 'user' ? '🎉 You Won!' : result.winner === 'opponent' ? '💀 You Lost!' : '🤝 It\'s a Draw!'}
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>
                  ELO Change: <span style={{ color: result.eloChange > 0 ? '#4ade80' : result.eloChange < 0 ? '#f87171' : '#94a3b8', fontWeight: 700 }}>
                    {result.eloChange > 0 ? '+' : ''}{result.eloChange}
                  </span>
                  &nbsp;•&nbsp; New ELO: <span style={{ color: '#f8fafc', fontWeight: 700 }}>{result.newElo}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>AI Verdict</div>
              <p style={{ color: '#ec4899', fontSize: 15, fontWeight: 600, fontStyle: 'italic', marginBottom: 8 }}>"{result.verdict}"</p>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Best trait: <span style={{ color: '#f8fafc', fontWeight: 600 }}>{result.trait}</span></div>

              <button
                onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); }}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #2a2f3a', borderRadius: 8, color: '#94a3b8', marginTop: 32, cursor: 'pointer', fontWeight: 600 }}
              >
                Duel Again
              </button>
            </div>

            {/* User Photo Preview */}
            <div style={{ background: '#0f1115', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e222a' }}>
              <img src={previewUrl!} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
              <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(0,0,0,0.8)', borderTop: '1px solid #1e222a' }}>
                <div style={{ fontSize: 14, color: '#f8fafc', fontWeight: 600 }}>Your Snapshot</div>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
