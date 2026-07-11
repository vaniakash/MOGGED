'use client';
import AuthGuard from '@/components/AuthGuard';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, RefreshCcw, Activity } from 'lucide-react';
import Link from 'next/link';

export default function FaceScorePage() {
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

      const res = await fetch(`${BACKEND_URL}/api/face-score`, {
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

  const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
        <span>{label}</span>
        <span style={{ color: '#f8fafc' }}>{score}/10</span>
      </div>
      <div style={{ width: '100%', height: 6, background: '#1e222a', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
        />
      </div>
    </div>
  );

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
            <Activity size={48} color="#a855f7" />
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, marginBottom: 8 }}>Face Score AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>Upload a clear front-facing selfie for a brutally honest AI breakdown.</p>
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
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)'}
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
              onClick={handleAnalyze}
              disabled={!file || loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none', marginTop: 24,
                background: !file ? '#1e222a' : loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: !file ? '#64748b' : '#fff', fontWeight: 700, fontSize: 16,
                cursor: !file || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Analyzing 468 landmarks...</> : 'Analyze My Face'}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {/* Image Result */}
            <div style={{ background: '#0f1115', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e222a' }}>
              <img src={previewUrl!} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>OVERALL SCORE</div>
                <div style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 64, lineHeight: 1, color: '#f8fafc', marginBottom: 8 }}>{result.overall_score}<span style={{ fontSize: 32, color: '#64748b' }}>/10</span></div>
                <p style={{ color: '#ec4899', fontSize: 16, fontWeight: 600, fontStyle: 'italic' }}>"{result.verdict}"</p>
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ padding: '24px', background: '#0f1115', borderRadius: 16, border: '1px solid #1e222a' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>Facial Breakdown</h3>
              <ScoreBar label="Jawline" score={result.jawline} />
              <ScoreBar label="Symmetry" score={result.symmetry} />
              <ScoreBar label="Eyes" score={result.eyes} />
              <ScoreBar label="Skin" score={result.skin} />
              <ScoreBar label="Cheekbones" score={result.cheekbones} />

              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginTop: 32, marginBottom: 16 }}>AI Improvement Tips</h3>
              <ul style={{ paddingLeft: 20, color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                {result.tips?.map((t: string, i: number) => (
                  <li key={i} style={{ marginBottom: 8 }}>{t}</li>
                ))}
              </ul>
              
              <button
                onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); }}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #2a2f3a', borderRadius: 8, color: '#94a3b8', marginTop: 24, cursor: 'pointer', fontWeight: 600 }}
              >
                Scan Another Face
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
