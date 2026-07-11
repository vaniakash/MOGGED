'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCcw, Sparkles, Coins } from 'lucide-react';
import Link from 'next/link';

export default function GlowUpPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [variant, setVariant] = useState('skincare');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    const sessionId = localStorage.getItem('omogl_session') || 'demo-session';
    try {
      const res = await fetch(`${BACKEND_URL}/api/glow-up/credits?sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok) setCredits(data.balance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setResult(null);
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    if (credits !== null && credits <= 0) {
      setError('You are out of credits. Please purchase more.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sessionId = localStorage.getItem('omogl_session') || 'demo-session';
      const formData = new FormData();
      formData.append('selfie', file);
      formData.append('sessionId', sessionId);
      formData.append('variant', variant);

      const res = await fetch(`${BACKEND_URL}/api/glow-up`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResult(data);
      setCredits(data.creditsRemaining);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const variants = [
    { id: 'skincare', label: 'Clear Skin' },
    { id: 'haircut', label: 'Fresh Haircut' },
    { id: 'beard', label: 'Groomed Beard' },
    { id: 'lighting', label: 'Studio Light' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050508', color: '#f8fafc', padding: '40px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Link href="/tools" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#64748b', fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}>
            ← Back to Tools Hub
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', padding: '6px 12px', borderRadius: 99, color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
            <Coins size={14} />
            {credits !== null ? `${credits} Credits` : '...'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Sparkles size={48} color="#fbbf24" />
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: 48, marginBottom: 8 }}>Glow-Up Simulator</h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>See your maximum potential. Generates a photorealistic glow-up using AI.</p>
        </div>

        {!result ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 400, margin: '0 auto' }}>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  style={{
                    flex: '0 0 auto', padding: '8px 16px', borderRadius: 99,
                    background: variant === v.id ? 'rgba(251,191,36,0.15)' : 'transparent',
                    border: variant === v.id ? '1px solid #fbbf24' : '1px solid #2a2f3a',
                    color: variant === v.id ? '#fbbf24' : '#94a3b8',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#0f1115', border: '2px dashed #1e222a', borderRadius: 16,
                padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)'}
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
              </div>
              <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileSelect} />
            </div>

            {error && <div style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>⚠️ {error}</div>}

            <button
              onClick={handleGenerate}
              disabled={!file || loading}
              style={{
                width: '100%', padding: '16px', borderRadius: 12, border: 'none', marginTop: 24,
                background: !file ? '#1e222a' : loading ? 'rgba(251,191,36,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: !file ? '#64748b' : '#fff', fontWeight: 700, fontSize: 16,
                cursor: !file || loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <><RefreshCcw size={18} className="animate-spin" /> Generating (10-15s)...</> : 'Generate Glow-Up (1 Credit)'}
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, maxWidth: 800, margin: '0 auto' }}>
              
              <div style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e222a' }}>
                <img src={`data:image/jpeg;base64,${result.original}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>BEFORE</div>
              </div>

              <div style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #fbbf24' }}>
                <img src={`data:image/jpeg;base64,${result.generated}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 16, left: 16, background: '#fbbf24', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#000' }}>AFTER ({result.variant.toUpperCase()})</div>
              </div>

            </div>

            <div style={{ maxWidth: 400, margin: '32px auto 0' }}>
              <button
                onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); }}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #2a2f3a', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                Try Another Variant
              </button>
            </div>
            
          </motion.div>
        )}
      </div>
    </div>
  );
}
