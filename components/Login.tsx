import React, { useState } from 'react';
import { login, register, getApiErrorMessage } from '../api';
import { isDateAfterToday } from '../utils/dateHelpers';
import type { LoginResponse } from '../api';

/** Inline glass blur so it can't be overridden by stylesheet order (same as Dashboard). */
const glassStyle: React.CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  isolation: 'isolate',
};

interface LoginProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [journalName, setJournalName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(trimmedEmail, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!journalName.trim()) {
      setError('Please enter a name for your journal (e.g. "Carla & Edgardo").');
      return;
    }
    if (startDate.trim() && isDateAfterToday(startDate.trim())) {
      setError('Relationship start date cannot be in the future.');
      return;
    }
    setLoading(true);
    try {
      const data = await register({
        email: trimmedEmail,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        journalName: journalName.trim(),
        startDate: startDate.trim() || undefined,
      });
      onLoginSuccess(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full font-sans">
      {/* Left Side: Imagery */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-bg-dark">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105 opacity-80"
          style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-black/40"></div>
        
        <div className="relative z-10 px-12 text-white max-w-xl">
          <div className="flex items-center gap-3 mb-6 animate-float">
            <span className="material-icons-round text-4xl text-primary">favorite</span>
            <h1 className="text-3xl font-bold tracking-tight">LoveStory</h1>
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-6">
            Every love story <br /> is beautiful.
          </h2>
          <p className="text-xl font-light opacity-90 leading-relaxed">
            Securely preserve your most cherished milestones and keep the flame alive, one memory at a time.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form – light glass so background hearts stay visible */}
      <div className="flex flex-col w-full lg:w-1/2 justify-center items-center p-6 lg:p-24 min-h-screen min-h-[100dvh] transition-colors duration-500 bg-white/25 dark:bg-slate-900/30 border-0 border-slate-200/40 dark:border-slate-700/40 lg:border-l" style={glassStyle}>
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <span className="material-icons-round text-primary text-3xl">favorite</span>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">LoveStory</h2>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3">
              {mode === 'login' ? 'Secure Login' : 'Create Account'}
            </h1>
            <p className="text-primary text-lg italic">
              {mode === 'login' ? 'Our journey continues...' : 'Start your love story.'}
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Email</label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
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
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold">Password</label>
                  <a href="#" className="text-primary text-xs font-bold hover:underline">Forgot Password?</a>
                </div>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full h-14 pl-12 pr-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button type="button" className="absolute right-4 text-slate-400 hover:text-primary">
                    <span className="material-icons-round">visibility</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center px-1">
                <label className="relative flex items-center cursor-pointer">
                  <input type="checkbox" className="form-checkbox h-5 w-5 rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800" />
                  <span className="ml-3 text-slate-700 dark:text-slate-300 text-sm font-medium">Remember Us</span>
                </label>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary-dark text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-icons-round animate-spin">refresh</span>
                    Signing in...
                  </span>
                ) : (
                  <>
                    <span>Enter Our World</span>
                    <span className="material-icons-round">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Email</label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none dark:text-white"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">First name</label>
                  <input 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="w-full h-12 pl-4 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                    placeholder="Edgardo"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Last name</label>
                  <input 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="w-full h-12 pl-4 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                    placeholder="Gonzalez"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Password (min 6 characters)</label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Confirm password</label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Journal name</label>
                <div className="relative flex items-center group">
                  <span className="material-icons-round absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">menu_book</span>
                  <input 
                    type="text"
                    value={journalName}
                    onChange={(e) => setJournalName(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                    placeholder="Carla & Edgardo"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-1">The name of your shared journal</p>
              </div>
              <div className="space-y-2">
                <label className="text-slate-900 dark:text-white text-sm font-semibold px-1">Relationship start date (optional)</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 pl-4 pr-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                  disabled={loading}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary-dark text-on-primary font-bold rounded-full shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-icons-round animate-spin">refresh</span>
                    Creating account...
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-icons-round">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-12 text-center space-y-6">
            {mode === 'login' ? (
              <>
                <p className="text-slate-400 text-sm italic">"Welcome back to your story."</p>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Don&apos;t have an account yet?</p>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="btn-glass w-full h-12 border-2 border-primary/20 hover:border-primary text-primary font-bold rounded-full transition-colors"
                  >
                    Start Your Journey
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-400">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="btn-glass w-full h-12 border-2 border-primary/20 hover:border-primary text-primary font-bold rounded-full transition-colors"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;