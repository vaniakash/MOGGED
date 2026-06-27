'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EromifyAd() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed it this session
    const hasDismissed = sessionStorage.getItem('eromifyAdDismissed');
    if (!hasDismissed) {
      // Show ad after a short delay
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('eromifyAdDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        width: 320,
        backgroundColor: '#050508',
        border: '1px solid #1e222a',
        borderRadius: 16,
        boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(168, 85, 247, 0.1)',
        zIndex: 9999,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#fff',
        fontFamily: '"Inter", sans-serif',
        animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: 6,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
        onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        aria-label="Close ad"
      >
        <X size={14} />
      </button>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <img
          src="/ads/modelpopup.webp"
          alt="Eromify AI Models"
          style={{
            width: 80,
            height: 100,
            objectFit: 'cover',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        />
        <div style={{ flex: 1, paddingRight: 24 }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 13, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
            🚀 High-quality AI image & video generation
          </h4>
          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
            Try <strong>Eromify</strong> — featuring Seedance 2.0, Veo 3.1, FLUX, GPT Image 2, and more.
          </p>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#10b981', fontSize: 12 }}>✅</span> Affordable pricing
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#10b981', fontSize: 12 }}>✅</span> Fast generation
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#10b981', fontSize: 12 }}>✅</span> No tech skills required
        </div>
      </div>

      <a
        href="https://www.eromify.in"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          width: '100%',
          padding: '12px 0',
          background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
          color: '#fff',
          textAlign: 'center',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.02em',
          marginTop: 4,
          transition: 'all 0.2s',
          boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Start creating today ✨
      </a>
    </div>
  );
}
