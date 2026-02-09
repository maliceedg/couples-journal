import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddMemory from './components/AddMemory';
import Anniversary from './components/Anniversary';
import MemoryDetail from './components/MemoryDetail';
import CuteTextsView from './components/CuteTextsView';
import Profile from './components/Profile';
import { getJournal, getToken, setToken, clearToken, getApiErrorMessage } from './api';
import type { LoginResponse } from './api';
import { ACCENT_COLORS, getAccentByHex, normalizeHex, lightTintFromHex, darkTintFromHex, hexWithAlpha, textColorOnBackground } from './constants/colors';
import { ViewState } from './types';
import type { JournalData, Memory } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [checkingSession, setCheckingSession] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
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
    if (currentView === 'dashboard' || currentView === 'anniversary' || currentView === 'cute-texts' || currentView === 'profile') {
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
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            onViewMemory={(mem) => {
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
            onSave={() => setCurrentView('dashboard')}
          />
        );
      case 'anniversary':
        return <Anniversary onBack={() => setCurrentView('dashboard')} journal={journal} />;
      case 'memory-detail':
        return (
          <MemoryDetail
            memory={selectedMemory}
            dateFormat={journal?.dateFormat}
            onBack={() => setCurrentView('dashboard')}
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
