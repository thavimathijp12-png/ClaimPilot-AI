import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Activity, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, Clock, X } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { cn } from '../utils/cn';
import { formatRelativeTime } from '../utils/formatters';

export function LoginPage() {
  const [email, setEmail] = useState(() => localStorage.getItem('claimpilot_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('claimpilot_remembered_email')));
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Last Active Session State
  const [lastSession, setLastSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('claimpilot_last_session') || 'null');
    } catch {
      return null;
    }
  });

  const { login, demoAccounts } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleClearSavedSession = (e) => {
    e.stopPropagation();
    localStorage.removeItem('claimpilot_last_session');
    localStorage.removeItem('claimpilot_remembered_email');
    setLastSession(null);
    setEmail('');
    setRememberMe(false);
    toast.info('Session Cleared', 'Remembered credentials removed from this browser.');
  };

  const handleResumeLastSession = async () => {
    if (!lastSession) return;
    const account = demoAccounts.find((a) => a.email === lastSession.email);
    if (account) {
      handleQuickDemoLogin(account);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Missing Credentials', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      if (rememberMe) {
        localStorage.setItem('claimpilot_remembered_email', user.email);
        localStorage.setItem(
          'claimpilot_last_session',
          JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            roleCode: user.roleCode,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem('claimpilot_remembered_email');
        localStorage.removeItem('claimpilot_last_session');
      }
      toast.success('Welcome back!', `Signed in as ${user.name} (${user.role}).`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Authentication Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoAccount) => {
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setIsLoading(true);
    try {
      const user = await login(demoAccount.email, demoAccount.password, true);
      toast.success('Demo Session Started', `Signed in as ${user.name} (${user.role}).`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warning('Email Required', 'Please enter your registered email address.');
      return;
    }
    setForgotSubmitted(true);
    toast.info('Password Reset', 'In demo mode: you can log in with any demo credential displayed below.');
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary-50/70 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-500 flex items-center justify-center text-white shadow-elevated mb-4">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          ClaimPilot <span className="text-teal-600">AI</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
          Smarter Claims. Better Healthcare.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-navy">Sign in to your portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials or choose a pre-configured demo persona.
            </p>
          </div>

          {lastSession && (
            <div className="mb-5 p-3.5 bg-gradient-to-r from-primary-50/70 to-teal-50/50 rounded-xl border border-primary-100/80 flex items-center justify-between gap-3 animate-in fade-in-0 duration-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  name={lastSession.name}
                  size="sm"
                  className="border border-primary-200 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-navy truncate">
                      {lastSession.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-primary-100 text-primary-700 rounded truncate">
                      {lastSession.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>Last active {formatRelativeTime(lastSession.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleResumeLastSession}
                  className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-white hover:bg-primary-50 rounded-lg border border-primary-200 shadow-2xs transition-colors whitespace-nowrap"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={handleClearSavedSession}
                  title="Clear remembered session"
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enterprise Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@claimpilot.ai"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600">Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Persona Quick-Click Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                One-Click Demo Personas
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Access</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.roleCode}
                  type="button"
                  onClick={() => handleQuickDemoLogin(account)}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      src={account.avatar}
                      name={account.name}
                      role={account.role}
                      size="sm"
                      className="w-8 h-8"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy group-hover:text-primary-700 truncate">
                        {account.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {account.role} • {account.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary-600 group-hover:text-white transition-colors flex-shrink-0">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>HIPAA Security & Audit Logging Ready • 256-bit SSL</span>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-dropdown border border-slate-200">
            <h3 className="text-base font-bold text-navy">Password Assistance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your corporate email address to receive password reset instructions.
            </p>
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@claimpilot.ai"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
              />
              {forgotSubmitted && (
                <p className="text-xs text-emerald-600 font-medium">
                  Instructions dispatched. Please use the quick demo credentials.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

