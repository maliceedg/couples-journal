import React, { useRef } from 'react';
import TimeCounter from './TimeCounter';
import { memoryImageUrl } from '../api';
import { daysUntilNextMonthly, daysUntilNextYearly, formatDateByPreference, parseLocalDate } from '../utils/dateHelpers';
import { ViewState } from '../types';
import type { JournalData, Memory } from '../types';

const CUTE_TEXT_CARD_WIDTH = 320 + 24; // w-80 + gap-6 in px

/** Inline glass blur so it can't be overridden by stylesheet order (Tailwind, HMR, etc.) */
const glassStyle: React.CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  isolation: 'isolate',
};

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  onViewMemory: (memory: Memory) => void;
  journal: JournalData | null;
  loading: boolean;
  error: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onViewMemory, journal, loading, error }) => {
  const cuteTextsScrollRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4">
        <span className="material-icons-round text-primary text-5xl animate-pulse">favorite</span>
        <p className="text-slate-500 dark:text-slate-400">Loading your journal...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <span className="material-icons-round text-red-500 text-5xl">error_outline</span>
        <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Make sure the backend is running at {import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}</p>
      </div>
    );
  }
  if (!journal) {
    return null;
  }

  const { memories, cuteTexts, milestones } = journal;
  const journeyStats = [
    { icon: 'photo_library' as const, value: memories.length, label: 'Memories', subLabel: 'saved moments' },
    { icon: 'chat_bubble_outline' as const, value: cuteTexts.length, label: 'Cute texts', subLabel: 'saved messages' },
    { icon: 'star' as const, value: milestones.length, label: 'Milestones', subLabel: 'special dates' },
  ];
  const startDate = journal.startDate ? parseLocalDate(journal.startDate.slice(0, 10)) : null;
  const daysMonthly = startDate ? daysUntilNextMonthly(startDate) : 0;
  const daysYearly = startDate ? daysUntilNextYearly(startDate) : 0;

  const scrollCuteTexts = (direction: 'left' | 'right') => {
    const el = cuteTextsScrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -CUTE_TEXT_CARD_WIDTH : CUTE_TEXT_CARD_WIDTH;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-24 animate-fade-in space-y-16">
      
      {/* Header */}
      <header className="text-center mb-16 relative">
        <h1 className="font-display text-5xl md:text-7xl text-primary mb-4 drop-shadow-sm">{journal.name}</h1>
        <p className="text-lg md:text-xl italic text-slate-600 dark:text-slate-400">I love you, thank you for simply existing in my life</p>
        <div className="absolute top-0 right-0 hidden md:block">
           <button 
             onClick={() => onNavigate('anniversary')}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full text-xs font-bold text-primary shadow-lg hover:scale-105 transition-transform"
           >
             <span className="material-icons-round text-base">celebration</span>
             View Anniversary
           </button>
        </div>
      </header>

      {/* Time Together */}
      <section className="bg-white/50 dark:bg-slate-800/40 glass-panel p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-700/50" style={glassStyle}>
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">Time Together</h2>
          <button
            type="button"
            onClick={() => onNavigate('wrapped')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-primary"
            aria-label="Share your relationship wrapped"
          >
            <span className="material-icons-round text-xl">share</span>
          </button>
        </div>
        <TimeCounter startDate={startDate} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/20 p-4 rounded-2xl border border-primary/10">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-sm" style={{ backgroundColor: 'var(--color-primary-icon-bg-current, rgba(165,108,185,0.22))' }}>
               <span className="material-icons-round">calendar_today</span>
             </div>
             <div>
               <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Next Monthly</p>
               <p className="text-lg font-bold">{daysMonthly} {daysMonthly === 1 ? 'Day' : 'Days'} Left</p>
             </div>
          </div>
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/20 p-4 rounded-2xl border border-primary/10">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary shadow-sm" style={{ backgroundColor: 'var(--color-primary-icon-bg-current, rgba(165,108,185,0.22))' }}>
               <span className="material-icons-round">stars</span>
             </div>
             <div>
               <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Next Yearly</p>
               <p className="text-lg font-bold">{daysYearly} {daysYearly === 1 ? 'Day' : 'Days'} Left</p>
             </div>
          </div>
        </div>
      </section>

      {/* Memories Grid – latest 6 with View all */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 px-2">
          <div>
            <h2 className="text-3xl font-display font-bold text-primary">Our Memories</h2>
            <p className="text-slate-500 text-sm mt-1">Capturing every beautiful moment.</p>
          </div>
          <div className="flex items-center gap-3">
            {memories.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('memories')}
                className="btn-glass flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-colors font-semibold text-sm"
                style={glassStyle}
              >
                <span className="material-icons-round text-lg">grid_view</span>
                View all
              </button>
            )}
            <button
              onClick={() => onNavigate('add-memory')}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-on-primary px-5 py-3 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
            >
              <span className="material-icons-round text-sm">add_a_photo</span>
              <span className="hidden md:inline">Add Memory</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {memories.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 text-center" style={glassStyle}>
               <span className="material-icons-round text-5xl mb-4" style={{ color: 'var(--color-primary)' }}>photo_library</span>
               <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">No memories yet</p>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">Capture your first moment together and start building your story.</p>
               <button
                 type="button"
                 onClick={() => onNavigate('add-memory')}
                 className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-on-primary px-5 py-3 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
               >
                 <span className="material-icons-round text-sm">add_a_photo</span>
                 Add your first memory
               </button>
             </div>
           ) : (
             memories.slice(0, 6).map((mem, idx) => (
               <button
                 key={mem.id}
                 type="button"
                 onClick={() => onViewMemory(mem)}
                 className={`bg-white dark:bg-slate-800 p-3 pb-8 shadow-xl rounded-sm transform transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-10 cursor-pointer text-left w-full ${idx % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}
               >
                  <div className="aspect-square bg-slate-200 overflow-hidden rounded-sm mb-4">
                    <img src={memoryImageUrl(mem.image)} alt={mem.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <p className="font-display text-lg text-center text-slate-700 dark:text-slate-200 leading-tight">{mem.title}</p>
               </button>
             ))
           )}
        </div>
      </section>

      {/* Our journey – real counts from the journal; empty state with CTA when all zeros */}
      <section className="bg-white/40 dark:bg-slate-800/40 glass-panel rounded-[3rem] p-8 md:p-12 shadow-lg border border-white/20 dark:border-slate-700/50" style={glassStyle}>
        <div className="text-center mb-10">
          <span className="material-icons-round text-primary text-4xl mb-2">favorite</span>
          <h2 className="text-3xl font-display font-bold text-primary">Our journey</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Your story in numbers</p>
        </div>
        {memories.length === 0 && cuteTexts.length === 0 && milestones.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-6">
            <p className="text-slate-600 dark:text-slate-400 mb-6">Nothing here yet. Add your first memory to start your story.</p>
            <button
              type="button"
              onClick={() => onNavigate('add-memory')}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-on-primary px-5 py-3 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
            >
              <span className="material-icons-round text-sm">add_a_photo</span>
              Add your first memory
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {journeyStats.map((stat) => (
              <div key={stat.label} className="glass-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6 group" style={glassStyle}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors" style={{ backgroundColor: 'var(--color-primary-icon-bg-current, rgba(165,108,185,0.22))' }}>
                  <span className="material-icons-round text-primary group-hover:text-on-primary transition-colors" style={{ color: 'var(--color-primary)' }}>{stat.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
                    <span className="text-xs text-slate-400">{stat.subLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cute Texts Gallery */}
      <section>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 px-2">
          <h2 className="text-3xl font-display font-bold text-primary">Cute Texts Gallery</h2>
          <div className="flex items-center gap-3">
          {cuteTexts.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('cute-texts')}
              className="btn-glass flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-on-primary transition-colors font-semibold text-sm"
              style={glassStyle}
            >
              <span className="material-icons-round text-lg">grid_view</span>
              View all
            </button>
          )}
          {cuteTexts.length > 0 && (
          <div className="flex gap-2">
             <button
               type="button"
               onClick={() => scrollCuteTexts('left')}
               className="btn-glass w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
               aria-label="Previous cute text"
               style={glassStyle}
             >
               <span className="material-icons-round">chevron_left</span>
             </button>
             <button
               type="button"
               onClick={() => scrollCuteTexts('right')}
               className="btn-glass w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors"
               aria-label="Next cute text"
               style={glassStyle}
             >
               <span className="material-icons-round">chevron_right</span>
             </button>
          </div>
          )}
          </div>
        </div>
        
        <div
          ref={cuteTextsScrollRef}
          className="flex overflow-x-auto gap-6 pb-8 px-2 no-scrollbar snap-x snap-mandatory"
        >
          {cuteTexts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 py-8">No cute texts yet. Add one from Add Memory → Cute Text.</p>
          ) : (
          cuteTexts.map((msg) => (
            <div key={msg.id} className={`snap-center flex-shrink-0 w-80 p-6 rounded-t-3xl shadow-lg relative flex flex-col justify-between min-h-[200px] ${
              msg.color === 'primary' 
                ? 'bg-primary text-on-primary rounded-bl-3xl' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-l-4 border-primary rounded-br-3xl'
            }`}>
              {msg.isFavorite && (
                <span className={`material-icons-round absolute top-4 right-4 text-sm ${msg.color === 'primary' ? 'text-on-primary/70' : 'text-yellow-400'}`}>star</span>
              )}
              <p className="font-display italic text-lg leading-relaxed mb-4">"{msg.text}"</p>
              <div className={`flex items-center justify-between border-t pt-4 text-xs ${msg.color === 'primary' ? 'border-on-primary/20' : 'border-slate-100 dark:border-slate-700'}`}>
                <span className="font-bold uppercase tracking-wider">{msg.sender}</span>
                <span className="opacity-60">{formatDateByPreference(msg.date, journal.dateFormat ?? 'DMY')}</span>
              </div>
            </div>
          ))
          )}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;