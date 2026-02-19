import React, { useState } from 'react';
import { requestPasswordReset, getApiErrorMessage } from '../api';

const glassStyle: React.CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  isolation: 'isolate',
};

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(trimmed);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans">
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-bg-dark">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105 opacity-80"
          style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/40" />
        <div className="relative z-10 px-12 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-6 animate-float">
            <span className="material-icons-round text-4xl text-primary">favorite</span>
            <h1 className="text-3xl font-bold tracking-tight">LoveStory</h1>
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
            Every love story <br /> is beautiful.
          </h2>
          <p className="text-xl font-light opacity-90 leading-relaxed">
            We&apos;ll send you a link to reset your password.
          </p>
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
              Forgot password?
            </h1>
            <p className="text-primary text-lg italic">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 px-4 py-4 text-sm">
                If an account exists with that email, you&apos;ll receive a password reset link shortly. Check your inbox and spam folder.
              </div>
              <button
                type="button"
                onClick={onBack}
                className="w-full h-14 bg-primary hover:bg-primary-dark text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 text-lg"
              >
                <span className="material-icons-round">arrow_back</span>
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="text-slate-900 dark:text-white text-sm font-semibold px-1">
                  Email
                </label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-14 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white"
                    placeholder="you@example.com"
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
                    Sending...
                  </span>
                ) : (
                  <>
                    <span>Send reset link</span>
                    <span className="material-icons-round">email</span>
                  </>
                )}
              </button>
              <button type="button" onClick={onBack} className="w-full text-slate-600 dark:text-slate-400 text-sm font-medium hover:underline">
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
