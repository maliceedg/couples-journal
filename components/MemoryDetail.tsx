import React from 'react';
import { memoryImageUrl, deleteMemory, getApiErrorMessage } from '../api';
import { formatDateByPreference } from '../utils/dateHelpers';
import type { Memory } from '../types';
import type { DateFormatPreference } from '../types';

const CONFIRM_DELETE_WORD = 'delete';

interface MemoryDetailProps {
  memory: Memory | null;
  dateFormat?: DateFormatPreference;
  onBack: () => void;
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({ memory, dateFormat = 'DMY', onBack }) => {
  const [imgError, setImgError] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  if (!memory) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-slate-500 dark:text-slate-400">Memory not found.</p>
        <button
          onClick={onBack}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  const imageUrl = memory.image ? memoryImageUrl(memory.image) : '';
  const dateLabel = memory.date ? formatDateByPreference(memory.date, dateFormat) : memory.date;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium mb-8"
      >
        <span className="material-icons-round">arrow_back</span>
        Back to memories
      </button>

      <article className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {imageUrl && !imgError && (
          <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-900">
            <img
              src={imageUrl}
              alt={memory.title}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        {imageUrl && imgError && (
          <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-900 flex items-center justify-center">
            <span className="material-icons-round text-slate-400 text-6xl">broken_image</span>
          </div>
        )}
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20">
              {memory.type === 'milestone' ? 'Milestone' : 'Daily memory'}
            </span>
            <time className="text-slate-500 dark:text-slate-400 text-sm" dateTime={memory.date}>
              {dateLabel}
            </time>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {memory.title}
          </h1>
          {memory.description && (
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {memory.description}
            </p>
          )}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(null); }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              <span className="material-icons-round text-lg">delete_outline</span>
              Delete this memory
            </button>
          </div>
        </div>
      </article>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-slate-200 dark:border-slate-700">
            <h2 id="delete-dialog-title" className="text-xl font-display font-bold text-slate-800 dark:text-white mb-2">
              Delete this memory?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              This cannot be undone. Type <strong className="text-slate-700 dark:text-slate-300">&quot;{CONFIRM_DELETE_WORD}&quot;</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`Type "${CONFIRM_DELETE_WORD}" to confirm`}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              autoComplete="off"
              aria-label={`Type ${CONFIRM_DELETE_WORD} to confirm deletion`}
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-500" role="alert">{deleteError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText.trim().toLowerCase() !== CONFIRM_DELETE_WORD || deleting}
                onClick={async () => {
                  if (!memory) return;
                  setDeleting(true);
                  setDeleteError(null);
                  try {
                    await deleteMemory(memory.id);
                    setShowDeleteModal(false);
                    onBack();
                  } catch (err) {
                    setDeleteError(getApiErrorMessage(err, 'Failed to delete'));
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="flex-1 py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryDetail;
