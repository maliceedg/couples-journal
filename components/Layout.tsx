import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  isDark: boolean;
  showProfileLink?: boolean;
  onNavigateToProfile?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, isDark, showProfileLink, onNavigateToProfile, onLogout }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] relative overflow-x-hidden">
      {/* Background Hearts – full viewport so they never crop on small/long screens */}
      <div className="fixed inset-0 min-h-screen min-h-[100dvh] pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="material-icons-round absolute top-10 left-10 text-6xl animate-float" style={{ color: 'var(--color-primary-alpha-30, rgba(165,108,185,0.3))' }}>favorite</span>
        <span className="material-icons-round absolute bottom-24 left-20 text-9xl animate-float" style={{ animationDelay: '1s', color: 'var(--color-primary-alpha-30, rgba(165,108,185,0.3))' }}>favorite</span>
        <span className="material-icons-round absolute top-40 right-10 text-5xl animate-float" style={{ animationDelay: '2s', color: 'var(--color-primary-alpha-30, rgba(165,108,185,0.3))' }}>favorite</span>
        <span className="material-icons-round absolute bottom-20 right-1/4 text-8xl animate-float" style={{ animationDelay: '0.5s', color: 'var(--color-primary-alpha-30, rgba(165,108,185,0.3))' }}>favorite</span>
      </div>

      {showProfileLink && (
        <div className="fixed top-6 right-6 flex items-center gap-2 z-50">
          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary"
              aria-label="Open profile"
            >
              <span className="material-icons-round">person</span>
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary text-sm font-semibold"
              aria-label="Log out"
            >
              <span className="material-icons-round text-lg">logout</span>
              <span className="hidden sm:inline">Log out</span>
            </button>
          )}
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>

      <button 
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 p-4 bg-white dark:bg-slate-800 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform border border-primary/10 text-primary dark:text-white"
      >
        <span className="material-icons-round">{isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  );
};

export default Layout;
