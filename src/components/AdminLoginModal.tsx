import React, { useEffect, useState } from 'react';
import { Lock, LogOut, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onAdminAuthenticated: () => void;
}

export function AdminLoginModal({
  open,
  onClose,
  onAdminAuthenticated,
}: AdminLoginModalProps) {
  const { firebaseUser, authInfo, authError, signInWithGoogle, logout, clearAuthError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !signingIn) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, signingIn, onClose]);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    clearAuthError();
    const info = await signInWithGoogle();
    setSigningIn(false);
    if (info?.isAdmin) {
      onAdminAuthenticated();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#111111]/65 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-heading"
      onClick={() => {
        if (!signingIn) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#f2f2f2] border border-[#1e1e1e] rounded-[2px] max-w-md w-full p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#1e1e1e]/12">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[2px] border border-[#1e1e1e]/20 bg-white text-[#111111] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2
                id="admin-login-heading"
                className="text-lg swiss-heading uppercase text-[#111111]"
              >
                Portfolio Admin Access
              </h2>
              <p className="mt-0.5 text-xs font-normal text-[#838282]">
                Sign in with your authorized owner account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#1e1e1e]/20 text-[#111111] hover:bg-[#1e1e1e] hover:text-[#f2f2f2] inline-flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {firebaseUser && authInfo && !authInfo.isAdmin ? (
            <div className="rounded-[2px] border border-[#1e1e1e]/25 bg-white p-4 space-y-3">
              <div className="flex items-start gap-2.5 text-[#111111]">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div className="text-sm">
                  <p className="font-bold">Administrator Access Denied</p>
                  <p className="mt-1 text-xs font-normal text-[#838282] leading-relaxed">
                    Signed in as <span className="font-medium text-[#111111]">{authInfo.email}</span>, which does
                    not have administrator permissions for this portfolio.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="swiss-pill-btn inline-flex items-center gap-2 px-4 py-2 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                Sign out and switch account
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-normal text-[#111111]/80 leading-relaxed">
                Authenticate with Google to unlock the Admin Dashboard and live Edit Website mode.
                All edits save directly to your PostgreSQL database.
              </p>

              {authError && (
                <div className="rounded-[2px] border border-[#1e1e1e] bg-white px-3.5 py-2.5 text-xs text-[#111111]">
                  {authError}
                </div>
              )}

              <button
                type="button"
                disabled={signingIn}
                onClick={() => void handleGoogleLogin()}
                className="swiss-pill-btn-solid w-full py-3 px-5 text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signingIn ? 'Signing in...' : 'Continue with Google'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
