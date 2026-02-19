import React, { useMemo, useState } from 'react';
import { formatDateByPreference } from '../utils/dateHelpers';
import { getCuteTextSenderDisplayName } from '../utils/cuteTextHelpers';
import type { JournalData, TextMessage } from '../types';

type FilterKind = 'all' | 'favorites' | 'regular';

interface CuteTextsViewProps {
  journal: JournalData | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

function CuteTextCard({
  msg,
  journal,
  dateFormat,
}: {
  msg: TextMessage;
  journal: JournalData | null;
  dateFormat: 'DMY' | 'MDY';
}) {
  const senderLabel = getCuteTextSenderDisplayName(msg, journal);
  return (
    <div
      className={`p-6 rounded-t-3xl shadow-lg relative flex flex-col justify-between min-h-[200px] ${
        msg.color === 'primary'
          ? 'bg-primary text-on-primary rounded-bl-3xl'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-l-4 border-primary rounded-br-3xl'
      }`}
    >
      {msg.isFavorite && (
        <span
          className={`material-icons-round absolute top-4 right-4 text-sm ${
            msg.color === 'primary' ? 'text-on-primary/70' : 'text-yellow-400'
          }`}
        >
          star
        </span>
      )}
      <p className="font-display italic text-lg leading-relaxed mb-4">&quot;{msg.text}&quot;</p>
      <div
        className={`flex items-center justify-between border-t pt-4 text-xs ${
          msg.color === 'primary' ? 'border-on-primary/20' : 'border-slate-100 dark:border-slate-700'
        }`}
      >
        <span className="font-bold uppercase tracking-wider">{senderLabel}</span>
        <span className="opacity-60">{formatDateByPreference(msg.date, dateFormat)}</span>
      </div>
    </div>
  );
}

const CuteTextsView: React.FC<CuteTextsViewProps> = ({ journal, loading, error, onBack }) => {
  const [filter, setFilter] = useState<FilterKind>('all');

  const sortedAndFiltered = useMemo(() => {
    const list = journal?.cuteTexts ?? [];
    if (filter === 'all') return list;
    if (filter === 'regular') return list.filter((m) => !m.isFavorite);
    // favorites: favorites first, then regular (both in original created order)
    const favorites = list.filter((m) => m.isFavorite);
    const regular = list.filter((m) => !m.isFavorite);
    return [...favorites, ...regular];
  }, [journal?.cuteTexts, filter]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4">
        <span className="material-icons-round text-primary text-5xl animate-pulse">favorite</span>
        <p className="text-slate-500 dark:text-slate-400">Loading texts...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <span className="material-icons-round text-red-500 text-5xl">error_outline</span>
        <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
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
  if (!journal) return null;

  const cuteTexts = journal.cuteTexts;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium mb-8"
      >
        <span className="material-icons-round">arrow_back</span>
        Back to dashboard
      </button>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
          Cute Texts Gallery
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your whole history of saved messages, by date created.
        </p>
      </header>

      {cuteTexts.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-12 text-center">
          No cute texts yet. Add one from the dashboard: Add Memory → Cute Text.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Filter
            </span>
            <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-600 p-1 bg-slate-100/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('favorites')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === 'favorites'
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Favorites first
              </button>
              <button
                type="button"
                onClick={() => setFilter('regular')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === 'regular'
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Regular only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFiltered.map((msg) => (
              <CuteTextCard key={msg.id} msg={msg} journal={journal} dateFormat={journal.dateFormat ?? 'DMY'} />
            ))}
          </div>
          {sortedAndFiltered.length === 0 && filter === 'regular' && (
            <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
              No regular (non-favorite) texts. Switch to All or Favorites first.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default CuteTextsView;
