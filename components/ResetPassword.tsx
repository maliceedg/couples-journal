import React, { useState } from 'react';
import { resetPassword, getApiErrorMessage } from '../api';

const glassStyle: React.CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  isolation: 'isolate',
};

interface ResetPasswordProps {
  token: string;
  onSuccess: () => void;
  onBack: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token, onSuccess, onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reset password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans">
        <div className="flex flex-col w-full lg:w-1/2 justify-center items-center p-6 lg:p-24 min-h-screen min-h-[100dvh] bg-white/25 dark:bg-slate-900/30 border-0 lg:border-l border-slate-200/40 dark:border-slate-700/40" style={glassStyle}>
          <div className="w-full max-w-md text-center animate-fade-in">
            <span className="material-icons-round text-green-500 text-6xl mb-4">check_circle</span>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">Password reset</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Your password has been updated. Redirecting to login...</p>
            <button type="button" onClick={onSuccess} className="text-primary font-semibold hover:underline">
              Go to login now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans">
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-bg-dark">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/40" />
        <div className="relative z-10 px-12 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons-round text-4xl text-primary">favorite</span>
            <h1 className="text-3xl font-bold tracking-tight">LoveStory</h1>
          </div>
          <h2 className="text-5xl font-display font-bold leading-tight mb-6">Set a new password</h2>
          <p className="text-xl font-light opacity-90">Choose a secure password you&apos;ll remember.</p>
        </div>
      </div>

      <div
        className="flex flex-col w-full lg:w-1/2 justify-center items-center p-6 lg:p-24 min-h-screen min-h-[100dvh] bg-white/25 dark:bg-slate-900/30 border-0 border-slate-200/40 dark:border-slate-700/40 lg:border-l"
        style={glassStyle}
      >
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <span className="material-icons-round text-primary text-3xl">favorite</span>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">LoveStory</h2>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3">
              New password
            </h1>
            <p className="text-primary text-lg italic">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="reset-new" className="text-slate-900 dark:text-white text-sm font-semibold px-1">
                New password (min 6 characters)
              </label>
              <div className="relative flex items-center group">
                <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="reset-new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-14 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="reset-confirm" className="text-slate-900 dark:text-white text-sm font-semibold px-1">
                Confirm password
              </label>
              <div className="relative flex items-center group">
                <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input
                  id="reset-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-14 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary-dark text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 text-lg disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="material-icons-round animate-spin">refresh</span>
                  Resetting...
                </span>
              ) : (
                <>
                  <span>Reset password</span>
                  <span className="material-icons-round">check</span>
                </>
              )}
            </button>
            <button type="button" onClick={onBack} className="w-full text-slate-600 dark:text-slate-400 text-sm font-medium hover:underline">
              Back to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
