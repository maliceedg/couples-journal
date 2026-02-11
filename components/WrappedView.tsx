import React, { useRef, useState } from 'react';
import { domToPng, domToBlob } from 'modern-screenshot';
import { memoryImageUrl } from '../api';
import { daysBetween, parseLocalDate } from '../utils/dateHelpers';
import { parseSongUrl } from '../utils/songUrl';
import type { JournalData } from '../types';

interface WrappedViewProps {
  journal: JournalData | null;
  onBack: () => void;
}

const currentYear = new Date().getFullYear();

/** Inline SVGs so icons render in the captured image (icon fonts often don't). */
const CardIcon = ({
  name,
  className = 'w-4 h-4 opacity-70',
}: {
  name: 'photo_library' | 'stars' | 'chat_bubble' | 'music_note' | 'favorite';
  className?: string;
}) => {
  const icons: Record<typeof name, React.ReactNode> = {
    photo_library: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zM11 12l2.03 2.71L16 11l4 5H8l3-4z" />
        <path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
      </svg>
    ),
    stars: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
    chat_bubble: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    music_note: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
      </svg>
    ),
    favorite: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  };
  return <span className="inline-flex items-center justify-center shrink-0">{icons[name]}</span>;
};

const WrappedView: React.FC<WrappedViewProps> = ({ journal, onBack }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const startDate = journal?.startDate
    ? parseLocalDate(journal.startDate.slice(0, 10))
    : null;
  const days = startDate ? Math.max(0, daysBetween(startDate)) : 0;
  const memories = journal?.memories ?? [];
  const polaroidMemories = memories.slice(0, 4);
  const coupleName = journal?.name ?? 'Us';
  const parsedSong = journal?.songUrl ? parseSongUrl(journal.songUrl) : null;
  const songCardLabel = (() => {
    if (!parsedSong) return '—';
    const title = journal?.songTitle?.trim();
    const artist = journal?.songArtist?.trim();
    if (title && artist) return `${artist} – ${title}`;
    if (title) return title;
    return parsedSong.type === 'youtube' ? 'YouTube' : 'Spotify';
  })();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await domToPng(cardRef.current, { scale: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `relationship-wrapped-${currentYear}.png`;
      a.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    if (!navigator.share) {
      const fallback = await domToPng(cardRef.current, { scale: 2 });
      const a = document.createElement('a');
      a.href = fallback;
      a.download = `relationship-wrapped-${currentYear}.png`;
      a.click();
      return;
    }
    setSharing(true);
    try {
      const blob = await domToBlob(cardRef.current, { scale: 2 });
      if (!blob) return;
      const file = new File([blob], `relationship-wrapped-${currentYear}.png`, {
        type: 'image/png',
      });
      await navigator.share({
        files: [file],
        title: 'Our Year in Love',
        text: `${coupleName} – ${days} days together`,
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error('Share failed:', e);
    } finally {
      setSharing(false);
    }
  };

  if (!journal) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center text-slate-500 dark:text-slate-400">
        <p>Loading your story…</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8 pb-24 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium mb-8"
      >
        <span className="material-icons-round">arrow_back</span>
        <span>Back to dashboard</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Controls & context */}
        <div className="flex flex-col space-y-8 text-slate-800 dark:text-white">
          <div className="space-y-4">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase border"
              style={{
                backgroundColor: 'var(--color-primary-alpha-15)',
                color: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
              }}
            >
              Wrapped {currentYear}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">
              Your love story,<br />
              <span className="italic" style={{ color: 'var(--color-primary)' }}>
                visualized.
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md">
              Every laugh, every date, and every moment together. Export your
              relationship highlights and share your journey.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-between w-full max-w-xs px-6 py-4 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-70 text-white border-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span>{downloading ? 'Preparing…' : 'Download Card'}</span>
              <span className="material-icons-round">download</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center justify-between w-full max-w-xs px-6 py-4 rounded-xl transition-all font-bold disabled:opacity-70 backdrop-blur-xl border border-slate-300/50 dark:border-white/20 bg-white/40 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 text-slate-800 dark:text-white"
              style={{ isolation: 'isolate' } as React.CSSProperties}
            >
              <span>{sharing ? 'Opening share…' : 'Share to Story'}</span>
              <span className="material-icons-round">ios_share</span>
            </button>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-4 border-slate-200 dark:border-slate-700 bg-primary/20" style={{ color: 'var(--color-primary)' }}>
                <span className="material-icons-round">favorite</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{coupleName}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  {days} days and counting
                </p>
              </div>
            </div>
          </div>

          {parsedSong && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-700 w-full min-w-0 max-w-xs">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Listen to our song</p>
              <div
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900/50 w-full"
                style={{ minHeight: parsedSong.type === 'youtube' ? 225 : 152 }}
              >
                {parsedSong.type === 'youtube' ? (
                  <iframe
                    key={parsedSong.embedUrl}
                    title="Our Song (YouTube)"
                    src={`${parsedSong.embedUrl}?rel=0`}
                    className="w-full border-0 block"
                    style={{ width: '100%', height: 225, minHeight: 225 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    key={parsedSong.embedUrl}
                    title="Our Song (Spotify)"
                    src={`${parsedSong.embedUrl}?utm_source=oembed`}
                    className="w-full border-0 block"
                    style={{ width: '100%', height: 152, minHeight: 152 }}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                <a
                  href={parsedSong.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium underline"
                >
                  Open in {parsedSong.type === 'youtube' ? 'YouTube' : 'Spotify'}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Right: Shareable card preview (captured by modern-screenshot) */}
        <div className="relative flex justify-center">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] -z-10 opacity-30"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <div
            ref={cardRef}
            className="relative w-full max-w-[360px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10"
            style={{
              backgroundColor: 'var(--bg-accent, #fcf5fd)',
              color: 'var(--color-primary)',
            }}
          >
            {/* Subtle noise overlay (preview only; may not capture in screenshot) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              }}
              aria-hidden
            />
            {/* Top: Header */}
            <div className="pt-10 px-6 text-center relative">
              <p
                className="font-bold tracking-[0.2em] uppercase text-xs mb-2"
                style={{ color: 'var(--color-primary)' }}
              >
                OUR YEAR IN LOVE
              </p>
              <div className="relative inline-block">
                {/* Offset, smaller, italic shadow number */}
                <span
                  className="absolute -top-4 -right-2 text-5xl md:text-6xl font-black select-none italic opacity-40"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden
                >
                  {days}
                </span>
                <h2
                  className="relative text-7xl md:text-8xl font-black leading-none select-none"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {days}
                </h2>
              </div>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-xl tracking-wide mt-1">
                Days of us
              </p>
            </div>

            {/* Middle: Polaroid-style memories (square polaroids, more bottom margin) */}
            <div className="flex-grow relative mt-10 mb-8 min-h-[160px]">
              {polaroidMemories.map((mem, i) => {
                const rotations = ['-rotate-6', 'rotate-3', 'rotate-12', '-rotate-12'];
                const positions = [
                  'top-0 left-6',
                  'top-10 right-6',
                  'bottom-14 left-8',
                  'bottom-2 right-6',
                ];
                const sizes = ['w-32', 'w-36', 'w-32', 'w-28'];
                return (
                  <div
                    key={mem.id}
                    className={`absolute ${positions[i]} ${sizes[i]} bg-white shadow-lg ${rotations[i]}`}
                    style={{
                      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.25)',
                      padding: '6px 6px 24px 6px',
                    }}
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img
                        src={memoryImageUrl(mem.image)}
                        alt=""
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: Stats */}
            <div
              className="px-6 py-8 rounded-t-[2rem] mt-auto"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                    Memories
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black leading-none">{memories.length}</span>
                    <CardIcon name="photo_library" className="w-4 h-4 opacity-70 pb-0.5" />
                  </div>
                </div>
                <div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                    Milestones
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black leading-none">{journal.milestones.length}</span>
                    <CardIcon name="stars" className="w-4 h-4 opacity-70 pb-0.5" />
                  </div>
                </div>
                <div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                    Cute texts
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black leading-none">{journal.cuteTexts.length}</span>
                    <CardIcon name="chat_bubble" className="w-4 h-4 opacity-70 pb-0.5" />
                  </div>
                </div>
                <div>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block mb-0.5">
                    Our song
                  </span>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <CardIcon name="music_note" className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-bold truncate">
                      {songCardLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3 flex-nowrap gap-2">
                <span className="text-xs font-bold tracking-tight shrink-0">{coupleName}</span>
                <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                  <CardIcon name="favorite" className="w-4 h-4 text-white/90" />
                  <span className="text-white/60 text-[8px] font-bold tracking-widest uppercase whitespace-nowrap">
                    Relationship Wrapped
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WrappedView;
