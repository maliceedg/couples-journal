import React, { useState } from 'react';
import { daysBetween, yearsBetween, nextAnniversaryDate, formatDateByPreference, parseLocalDate } from '../utils/dateHelpers';
import { memoryImageUrl } from '../api';
import type { JournalData } from '../types';

interface AnniversaryProps {
  onBack: () => void;
  journal: JournalData | null;
}

const Anniversary: React.FC<AnniversaryProps> = ({ onBack, journal }) => {
  const [highlightReelOpen, setHighlightReelOpen] = useState(false);
  const [reelIndex, setReelIndex] = useState(0);

  const milestones = journal?.milestones ?? [];
  const memories = journal?.memories ?? [];
  const coupleName = journal?.name ?? 'Carla & Edgardo';
  const startDate = journal?.startDate ? parseLocalDate(journal.startDate.slice(0, 10)) : null;
  const years = startDate ? yearsBetween(startDate) : 0;
  const daysOfJoy = startDate ? daysBetween(startDate) : 0;
  const nextAnniversary = startDate ? nextAnniversaryDate(startDate) : null;
  const nextAnniversaryLabel = nextAnniversary
    ? nextAnniversary.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const coverImage = memories.length > 0 ? memoryImageUrl(memories[0].image) : 'https://picsum.photos/1920/1080?grayscale';
  const canPlayReel = memories.length > 0;

  const goReelPrev = () => setReelIndex((i) => (i <= 0 ? memories.length - 1 : i - 1));
  const goReelNext = () => setReelIndex((i) => (i >= memories.length - 1 ? 0 : i + 1));

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 pb-24 space-y-16 animate-fade-in">
      
      {/* Header */}
      <header className="relative pt-12 pb-8 text-center">
        <button onClick={onBack} className="absolute top-0 left-0 p-3 bg-white dark:bg-slate-800 rounded-full shadow hover:shadow-lg transition-all text-slate-400 hover:text-primary">
          <span className="material-icons-round">arrow_back</span>
        </button>

        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/20 border border-primary/40">
          <span className="font-bold tracking-widest text-xs uppercase" style={{ color: 'var(--color-primary)' }}>Special Celebration</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-sm" style={{ color: 'var(--color-primary)' }}>
          <span className="text-slate-800 dark:text-slate-100">
            {years > 0 ? `Happy ${ordinal(years)} Anniversary,` : 'Start of a journey,'}
          </span>
          <br />
          <span style={{ color: 'var(--color-primary)' }}>{coupleName}!</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-display italic max-w-2xl mx-auto">
          {years > 0
            ? `"${years} ${years === 1 ? 'year' : 'years'} of laughter, growth, and building a world that belongs only to us."`
            : '"Every day with you is worth celebrating. Here\'s to the beginning of our story."'}
        </p>
      </header>

      {/* Upcoming – planned features (pin: video export via Backend + FFmpeg); above reel so users see it first */}
      <section className="rounded-[2rem] border border-primary/20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 md:p-8">
        <h2 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="material-icons-round text-primary">upcoming</span>
          Upcoming
        </h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-3">
            <span className="material-icons-round text-primary mt-0.5">movie_creation</span>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">Video highlight reel</span>
              <p className="text-sm mt-0.5">Export a video of your memories to download and share. Planned implementation: <strong className="text-primary">Backend (Node) + FFmpeg</strong>.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Highlight Reel – plays slideshow of memories; video export planned (Backend + FFmpeg) */}
      <section className="space-y-8">
        <div className="relative group aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-primary/20 bg-black">
          <img
            alt=""
            className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
            src={coverImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-center justify-center">
            {canPlayReel ? (
              <button
                type="button"
                onClick={() => { setReelIndex(0); setHighlightReelOpen(true); }}
                className="w-20 h-20 bg-white/90 hover:bg-primary hover:text-on-primary text-primary transition-colors rounded-full flex items-center justify-center shadow-2xl group/play"
              >
                <span className="material-icons-round text-4xl ml-1">play_arrow</span>
              </button>
            ) : (
              <div className="text-center text-white/90 px-4">
                <p className="font-display text-lg md:text-xl">Add memories to build your reel</p>
                <p className="text-sm opacity-80 mt-1">Play a slideshow here once you have photos</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="font-display text-3xl font-bold">The Highlight Reel</p>
            <p className="text-xs opacity-70 mt-2 flex items-center gap-1.5">
              <span className="material-icons-round text-sm">info</span>
              Play slideshow now · Video download coming soon
            </p>
          </div>
        </div>

        {/* Full-screen slideshow modal */}
        {highlightReelOpen && memories.length > 0 && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Highlight reel slideshow"
          >
            <button
              type="button"
              onClick={() => setHighlightReelOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Close"
            >
              <span className="material-icons-round">close</span>
            </button>
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center px-4">
              <img
                src={memoryImageUrl(memories[reelIndex].image)}
                alt={memories[reelIndex].title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center bg-black/50 rounded-full px-4 py-2 text-sm">
                {memories[reelIndex].title} · {formatDateByPreference(memories[reelIndex].date, journal?.dateFormat ?? 'DMY')}
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                type="button"
                onClick={goReelPrev}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous"
              >
                <span className="material-icons-round">chevron_left</span>
              </button>
              <span className="text-white text-sm font-medium">{reelIndex + 1} / {memories.length}</span>
              <button
                type="button"
                onClick={goReelNext}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next"
              >
                <span className="material-icons-round">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary p-8 rounded-[2rem] text-on-primary shadow-xl flex flex-col items-center text-center relative overflow-hidden">
          <span className="material-icons-round text-on-primary text-9xl absolute -bottom-8 -right-8 opacity-20">favorite</span>
          <span className="material-icons-round text-on-primary text-4xl mb-4 relative z-10">favorite</span>
          <div className="text-4xl font-bold relative z-10">{years}</div>
          <div className="text-sm opacity-70 uppercase tracking-widest mt-1 relative z-10">Years Together</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-primary/10 flex flex-col items-center text-center">
          <span className="material-icons-round text-primary text-4xl mb-4">auto_stories</span>
          <div className="text-4xl font-bold text-slate-800 dark:text-white">{daysOfJoy.toLocaleString()}</div>
          <div className="text-sm text-slate-500 uppercase tracking-widest mt-1">Days of Joy</div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-primary/10 flex flex-col items-center text-center">
          <span className="material-icons-round text-primary text-4xl mb-4">celebration</span>
          <div className="text-4xl font-bold text-slate-800 dark:text-white">{nextAnniversaryLabel || '—'}</div>
          <div className="text-sm text-slate-500 uppercase tracking-widest mt-1">Next Anniversary</div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-secondary/30 dark:bg-white/5 backdrop-blur-xl p-8 md:p-16 rounded-[3rem] border border-primary/10">
        <h2 className="text-4xl font-display font-bold text-slate-800 dark:text-slate-100 mb-16 text-center flex items-center justify-center gap-4">
          <span className="material-icons-round text-primary">timeline</span>
          Our Journey
          <span className="material-icons-round text-primary">timeline</span>
        </h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-primary/20 rounded-full"></div>
          
          <div className="space-y-12">
            {/* Featured Center Card */}
            {nextAnniversaryLabel && (
            <div className="relative flex flex-col items-center justify-center text-center group mb-16">
              <div className="z-20 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white dark:border-slate-900 mb-6">
                <span className="material-icons-round text-on-primary text-3xl">celebration</span>
              </div>
              <div className="max-w-xl bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border-2 border-primary ring-8 ring-primary/10 transform hover:scale-105 transition-transform">
                <span className="font-bold text-lg block mb-2 text-primary">{nextAnniversaryLabel}</span>
                <h3 className="text-3xl font-display font-bold text-primary mb-4">{years > 0 ? ordinal(years) : ''} Anniversary</h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                    "Here's to a lifetime more."
                </p>
              </div>
            </div>
            )}

            {/* Timeline Items */}
            {milestones.map((milestone, idx) => (
              <div key={milestone.id ?? idx} className={`relative flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center justify-between group`}>
                <div className="ml-12 md:ml-0 md:w-[45%] bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-primary/5 hover:border-primary/30 transition-all w-full">
                  <span className="text-primary font-bold text-sm block mb-1 uppercase tracking-widest">{formatDateByPreference(milestone.date, journal?.dateFormat ?? 'DMY')}</span>
                  <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">{milestone.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm italic">{milestone.description}</p>
                </div>
                
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-slate-900 shadow-sm top-6 md:top-1/2 md:-translate-y-1/2 z-10"></div>
                
                <div className="md:w-[45%]"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Anniversary;