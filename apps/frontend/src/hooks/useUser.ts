'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  plan: string;
}

export interface UseUserResult {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

/**
 * Reads the JWT from localStorage, then calls GET /auth/me to resolve
 * the current session user. Auto-clears the token on 401.
 *
 * Why /me and not decode the JWT? /me is the source of truth for the
 * user's current role/plan (the JWT may be stale if a role changed
 * server-side). Decoding locally also requires `jose` on the client and
 * a shared secret — `/me` is simpler and the DB hit is cheap.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.auth.me()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch((err: Error) => {
        const message = err.message || 'Failed to fetch user';
        setError(message);
        setUser(null);
        setLoading(false);
        // Only auto-logout on 401 — the token is truly invalid.
        // Other errors (network, 5xx) leave the token in place.
        if (message.includes('401')) {
          api.setToken(null);
          // Direct removal in case the test mocks setToken without side effects.
          // In production this is a no-op (setToken already removed it).
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      });
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    setError(null);
  }, []);

  return { user, loading, error, logout };
}
