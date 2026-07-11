'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export interface AuthUser {
  googleId?: string;
  email: string;
  displayName: string;
  photoURL?: string;
  elo: number;
  wins: number;
  losses: number;
  matches: number;
  provider?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  username?: string;
  nationality?: string;
  age?: number;
  gender?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  sessionId: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  sessionId: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Load the Google GSI script dynamically
function loadGSI(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.accounts) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount + listen for changes from email login
  useEffect(() => {
    const hydrate = () => {
      const storedSession = localStorage.getItem('omogl_session');
      const storedUser    = localStorage.getItem('omogl_user');
      if (storedSession) setSessionId(storedSession);
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch {}
      }
    };
    hydrate();
    setIsLoading(false);
    window.addEventListener('storage', hydrate);
    return () => window.removeEventListener('storage', hydrate);
  }, []);

  const handleGoogleToken = useCallback(async (idToken: string) => {
    const existingSession = localStorage.getItem('omogl_session');
    const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken, sessionId: existingSession }),
    });
    if (!res.ok) throw new Error('Authentication failed');
    const data = await res.json();

    localStorage.setItem('omogl_session', data.sessionId);
    localStorage.setItem('omogl_user', JSON.stringify(data.user));
    setSessionId(data.sessionId);
    setUser(data.user);
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await loadGSI();
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set');

    return new Promise<void>((resolve, reject) => {
      const g = (window as any).google;
      const client = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: () => {}, // not used for id_token flow
      });

      // Use the ID token flow instead
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            await handleGoogleToken(response.credential);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      g.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback: render a button in a popup
          reject(new Error('One Tap not displayed'));
        }
      });

      // Also expose for manual trigger (popup)
      (window as any).__googleSignIn = async (credential: string) => {
        try {
          await handleGoogleToken(credential);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
    });
  }, [handleGoogleToken]);

  const signOut = useCallback(() => {
    localStorage.removeItem('omogl_user');
    // Keep the sessionId so ELO history is preserved for future anonymous use
    setUser(null);

    const g = (window as any).google;
    if (g?.accounts?.id) {
      g.accounts.id.disableAutoSelect();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, sessionId, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
