import React, { useState, useRef, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, LogOut, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable SessionLockModal enforcing HIPAA workstation security standards (45 CFR § 164.312(a)(2)(iii)).
 * Locks screen display while preserving operational tab and form state.
 */
export default function SessionLockModal() {
  const { currentUser, isSessionLocked, unlockSession, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSessionLocked) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSessionLocked]);

  if (!isSessionLocked || !currentUser) {
    return null;
  }

  const handleUnlock = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const success = unlockSession(password);
      if (success) {
        toast.success('Session Resumed', 'Operational access restored.');
      } else {
        setError('Incorrect password. Use your demo password or quick unlock.');
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleQuickUnlock = () => {
    unlockSession();
    toast.success('Session Resumed', 'Operational access restored (Demo Mode).');
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
    toast.info('Signed Out', 'Your session was terminated safely.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-0 duration-200"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
        {/* Top security accent banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-rose-500" />

        <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <Lock className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h2 id="lock-modal-title" className="text-base font-bold text-navy">
          Session Locked for Security
        </h2>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>HIPAA 45 CFR § 164.312 Workstation Inactivity</span>
        </p>

        {/* User Card */}
        <div className="my-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-left">
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            role={currentUser.role}
            size="md"
            className="w-10 h-10 border border-slate-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-navy truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter password to unlock"
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Unlock Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleQuickUnlock}
            className="w-full py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
          >
            Quick Unlock (Demo Session)
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign out / Switch account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
