import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import AddMemory from './components/AddMemory';
import Anniversary from './components/Anniversary';
import MemoryDetail from './components/MemoryDetail';
import MemoriesView from './components/MemoriesView';
import CuteTextsView from './components/CuteTextsView';
import WrappedView from './components/WrappedView';
import Profile from './components/Profile';
import { getJournal, getToken, setToken, clearToken, getApiErrorMessage } from './api';
import type { LoginResponse } from './api';
import { ACCENT_COLORS, getAccentByHex, normalizeHex, lightTintFromHex, darkTintFromHex, hexWithAlpha, textColorOnBackground } from './constants/colors';
import { ViewState } from './types';
import type { JournalData, Memory } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [memoryDetailReturnView, setMemoryDetailReturnView] = useState<ViewState>('dashboard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset');
    if (reset?.trim()) {
      setResetToken(reset.trim());
      setCurrentView('reset-password');
      window.history.replaceState({}, '', window.location.pathname || '/');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset')?.trim()) {
      setCheckingSession(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    getJournal()
      .then((data) => {
        setJournal(data);
        setCurrentView('dashboard');
      })
      .catch(() => clearToken())
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    if (checkingSession) return;
    if (currentView === 'dashboard' || currentView === 'anniversary' || currentView === 'memories' || currentView === 'cute-texts' || currentView === 'profile' || currentView === 'wrapped') {
      setJournalLoading(true);
      setJournalError(null);
      getJournal()
        .then(setJournal)
        .catch((err) => setJournalError(getApiErrorMessage(err, 'Failed to load journal')))
        .finally(() => setJournalLoading(false));
    }
  }, [currentView, checkingSession]);

  const handleLoginSuccess = (data: LoginResponse) => {
    setToken(data.token);
    setJournal(data.journal);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    clearToken();
    setJournal(null);
    setCurrentView('login');
  };

  useEffect(() => {
    const rawHex = journal?.accentColor ?? '#A56CB9';
    const selectedHex = normalizeHex(rawHex);
    const accent = getAccentByHex(selectedHex) ?? ACCENT_COLORS[0];
    document.documentElement.style.setProperty('--color-primary', accent.hex);
    document.documentElement.style.setProperty('--color-primary-dark', accent.dark);
    document.documentElement.style.setProperty('--color-on-primary', textColorOnBackground(accent.hex));
    document.documentElement.style.setProperty('--color-primary-alpha-15', hexWithAlpha(selectedHex, 0.15));
    const iconBgLight = hexWithAlpha(selectedHex, 0.22);
    const iconBgDark = hexWithAlpha(selectedHex, 0.35);
    document.documentElement.style.setProperty('--color-primary-icon-bg', iconBgLight);
    document.documentElement.style.setProperty('--color-primary-icon-bg-dark', iconBgDark);
    document.documentElement.style.setProperty('--color-primary-icon-bg-current', isDark ? iconBgDark : iconBgLight);
    const bgTint = lightTintFromHex(selectedHex);
    const darkBg = darkTintFromHex(selectedHex);
    document.documentElement.style.setProperty('--bg-accent', bgTint);
    document.documentElement.style.setProperty('--bg-accent-dark', darkBg);
    document.body.style.backgroundColor = isDark ? darkBg : bgTint;
  }, [journal?.accentColor, isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const renderView = () => {
    if (checkingSession) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-bg-light dark:bg-bg-dark">
          <div className="flex flex-col items-center gap-4">
            <span className="material-icons-round animate-pulse text-4xl text-primary">favorite</span>
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      );
    }
    switch (currentView) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} onForgotPassword={() => setCurrentView('forgot-password')} />;
      case 'forgot-password':
        return <ForgotPassword onBack={() => setCurrentView('login')} />;
      case 'reset-password':
        return resetToken ? (
          <ResetPassword
            token={resetToken}
            onSuccess={() => {
              setResetToken(null);
              setCurrentView('login');
            }}
            onBack={() => {
              setResetToken(null);
              setCurrentView('login');
            }}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onForgotPassword={() => setCurrentView('forgot-password')} />
        );
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            onViewMemory={(mem) => {
              setMemoryDetailReturnView('dashboard');
              setSelectedMemory(mem);
              setCurrentView('memory-detail');
            }}
            journal={journal}
            loading={journalLoading}
            error={journalError}
          />
        );
      case 'add-memory':
        return (
          <AddMemory
            journal={journal}
            onCancel={() => setCurrentView('dashboard')}
            onSave={async () => {
              const data = await getJournal();
              setJournal(data);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'anniversary':
        return <Anniversary onBack={() => setCurrentView('dashboard')} journal={journal} />;
      case 'memories':
        return (
          <MemoriesView
            journal={journal}
            loading={journalLoading}
            error={journalError}
            onBack={() => setCurrentView('dashboard')}
            onViewMemory={(mem) => {
              setMemoryDetailReturnView('memories');
              setSelectedMemory(mem);
              setCurrentView('memory-detail');
            }}
          />
        );
      case 'memory-detail':
        return (
          <MemoryDetail
            memory={selectedMemory}
            dateFormat={journal?.dateFormat}
            onBack={() => setCurrentView(memoryDetailReturnView)}
          />
        );
      case 'cute-texts':
        return (
          <CuteTextsView
            journal={journal}
            loading={journalLoading}
            error={journalError}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'profile':
        return (
          <Profile
            journal={journal}
            journalLoading={journalLoading}
            onBack={() => setCurrentView('dashboard')}
            onPreferencesSaved={setJournal}
          />
        );
      case 'wrapped':
        return (
          <WrappedView
            journal={journal}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  const showProfileLink = !checkingSession && currentView !== 'login';

  return (
    <Layout
      toggleTheme={toggleTheme}
      isDark={isDark}
      showProfileLink={showProfileLink}
      onNavigateToProfile={() => setCurrentView('profile')}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
