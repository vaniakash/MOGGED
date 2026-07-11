'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCcw, Users, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function CelebrityMatchPage() {
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

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const sessionId = localStorage.getItem('omogl_session') || 'demo-session';
      const formData = new FormData();
      formData.append('selfie', file);
      formData.append('sessionId', sessionId);

      const res = await fetch(`${BACKEND_URL}/api/celebrity-match`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <Users size={48} color="#4ade80" />
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, marginBottom: 8 }}>Celebrity Match</h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Find your Hollywood, Bollywood, or K-pop lookalikes using AI facial feature matching.</p>
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
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(74,222,128,0.5)'}
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
                <div style={{ color: '#64748b', fontSize: 12 }}>Clear lighting, front-facing works best</div>
              </div>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {error && <div style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>⚠️ {error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none', marginTop: 24,
                background: !file ? '#1e222a' : loading ? 'rgba(74,222,128,0.5)' : 'linear-gradient(135deg, #22c55e, #10b981)',
                color: !file ? '#64748b' : '#fff', fontWeight: 700, fontSize: 16,
                cursor: !file || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Scanning database...</> : 'Find My Match'}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {/* Share Card */}
            <div style={{ background: '#0f1115', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e222a' }}>
              <div style={{ position: 'relative' }}>
                <img src={previewUrl!} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                   <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Vibe Match: {result.vibe}</div>
                   <div style={{ fontSize: 14, color: '#f8fafc', fontStyle: 'italic' }}>"{result.caption}"</div>
                </div>
              </div>
              <button
                style={{ width: '100%', padding: '16px', background: '#1e222a', border: 'none', color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
              >
                <Share2 size={18} /> Share Result
              </button>
            </div>

            {/* Match List */}
            <div style={{ padding: '24px', background: '#0f1115', borderRadius: 16, border: '1px solid #1e222a' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>Your Top Matches</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.matches.map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: i === 0 ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e222a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: i === 0 ? '#4ade80' : '#64748b' }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 15 }}>{m.name}</span>
                        <span style={{ fontWeight: 700, color: i === 0 ? '#4ade80' : '#94a3b8', fontSize: 14 }}>{m.similarity}%</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>Similarity: {m.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); }}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #2a2f3a', borderRadius: 8, color: '#94a3b8', marginTop: 24, cursor: 'pointer', fontWeight: 600 }}
              >
                Try Another Photo
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
