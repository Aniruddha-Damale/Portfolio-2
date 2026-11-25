import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { fetchAuthUser } from '../lib/api.ts';
import type { AuthUserInfo } from '../types/portfolio.ts';

interface AuthContextValue {
  firebaseUser: User | null;
  authInfo: AuthUserInfo | null;
  loading: boolean;
  authError: string | null;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<AuthUserInfo | null>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const syncUser = useCallback(async (user: User | null) => {
    if (!user) {
      setFirebaseUser(null);
      setAuthInfo(null);
      setLoading(false);
      return null;
    }
    try {
      const token = await user.getIdToken();
      const info = await fetchAuthUser(token);
      setFirebaseUser(user);
      setAuthInfo(info);
      setAuthError(null);
      setLoading(false);
      return info;
    } catch (err: any) {
      console.error('Auth verification failed:', err);
      setFirebaseUser(user);
      setAuthInfo(null);
      setAuthError(err.message || 'Unable to verify administrator session.');
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void syncUser(user);
    });
    return unsubscribe;
  }, [syncUser]);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      return await syncUser(result.user);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing.');
      } else {
        setAuthError(err?.message || 'Google Sign-In failed. Please try again.');
      }
      return null;
    }
  }, [syncUser]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setAuthInfo(null);
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authInfo,
        loading,
        authError,
        getToken,
        signInWithGoogle,
        logout,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
