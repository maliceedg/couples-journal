import React, { useMemo, useState } from 'react';
import { memoryImageUrl } from '../api';
import { formatDateByPreference } from '../utils/dateHelpers';
import type { JournalData, Memory } from '../types';

type MemoryFilter = 'all' | 'daily' | 'milestone';

interface MemoriesViewProps {
  journal: JournalData | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onViewMemory: (memory: Memory) => void;
}

function MemoryCard({
  memory,
  dateFormat,
  onClick,
  tiltClass,
}: Readonly<{
  memory: Memory;
  dateFormat: 'DMY' | 'MDY';
  onClick: () => void;
  tiltClass: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 p-3 pb-8 shadow-xl rounded-sm transform transition-all duration-300 hover:rotate-0 hover:scale-[1.02] hover:z-10 cursor-pointer text-left w-full ${tiltClass} hover:shadow-2xl`}
    >
      <div className="aspect-square bg-slate-200 overflow-hidden rounded-sm mb-4">
        <img
          src={memoryImageUrl(memory.image)}
          alt={memory.title}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="font-display text-lg text-slate-700 dark:text-slate-200 leading-tight truncate flex-1">
          {memory.title}
        </p>
        {memory.type === 'milestone' && (
          <span className="material-icons-round text-primary text-lg flex-shrink-0" title="Milestone">
            stars
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {formatDateByPreference(memory.date, dateFormat)}
      </p>
    </button>
  );
}

const MemoriesView: React.FC<MemoriesViewProps> = ({
  journal,
  loading,
  error,
  onBack,
  onViewMemory,
}) => {
  const [filter, setFilter] = useState<MemoryFilter>('all');

  const filteredMemories = useMemo(() => {
    const list = journal?.memories ?? [];
    if (filter === 'all') return list;
    return list.filter((m) => m.type === filter);
  }, [journal?.memories, filter]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4">
        <span className="material-icons-round text-primary text-5xl animate-pulse">favorite</span>
        <p className="text-slate-500 dark:text-slate-400">Loading memories...</p>
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

  const dateFormat = journal.dateFormat ?? 'DMY';

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
          Our Memories
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          All your saved moments. Filter by type or browse everything.
        </p>
      </header>

      {journal.memories.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 py-12 text-center">
          No memories yet. Add one from the dashboard.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Type
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
                onClick={() => setFilter('daily')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === 'daily'
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setFilter('milestone')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === 'milestone'
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Milestone
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMemories.map((mem, idx) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                dateFormat={dateFormat}
                onClick={() => onViewMemory(mem)}
                tiltClass={idx % 2 === 0 ? '-rotate-2' : 'rotate-2'}
              />
            ))}
          </div>
          {filteredMemories.length === 0 && filter !== 'all' && (
            <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
              No {filter} memories. Try another filter.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default MemoriesView;
