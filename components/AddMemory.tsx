import React, { useState } from 'react';
import { createMemory, createCuteText, uploadImage, getApiErrorMessage } from '../api';
import { parseUserDateToISO, formatDateInputMask } from '../utils/dateHelpers';
import type { JournalData, DateFormatPreference } from '../types';

type MemoryKind = 'daily' | 'milestone' | 'text';

interface AddMemoryProps {
  journal: JournalData | null;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
}

const AddMemory: React.FC<AddMemoryProps> = ({ journal, onCancel, onSave }) => {
  const dateFormat: DateFormatPreference = journal?.dateFormat ?? 'DMY';
  const datePlaceholder = dateFormat === 'DMY' ? 'dd/mm/yyyy' : 'mm/dd/yyyy';
  const [kind, setKind] = useState<MemoryKind>('daily');
  const [selectedType, setSelectedType] = useState<'daily' | 'milestone'>('daily');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryDate, setMemoryDate] = useState('');
  const [cuteDate, setCuteDate] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (kind === 'text') {
        const form = e.currentTarget;
        const text = (form.querySelector('#cute-text') as HTMLTextAreaElement)?.value?.trim();
        const sender = (form.querySelector('#cute-sender') as HTMLSelectElement)?.value ?? 'ME';
        const dateInput = cuteDate.trim();
        const dateISO = dateInput ? parseUserDateToISO(dateInput, dateFormat) : null;
        const date = dateISO ?? (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })();
        const color = (form.querySelector('input[name="cute-color"]:checked') as HTMLInputElement)?.value as 'white' | 'primary';
        const isFavorite = (form.querySelector('#cute-favorite') as HTMLInputElement)?.checked ?? true;
        if (!text) {
          setError('Please enter the message text.');
          setSaving(false);
          return;
        }
        if (dateInput && !dateISO) {
          setError(`Please enter the date as ${datePlaceholder}.`);
          setSaving(false);
          return;
        }
        await createCuteText({ text, sender, date, isFavorite, color });
        await onSave();
        return;
      }

      const form = e.currentTarget;
      const title = (form.querySelector('#title') as HTMLInputElement)?.value?.trim();
      const dateInput = memoryDate.trim();
      const description = (form.querySelector('#description') as HTMLTextAreaElement)?.value?.trim() ?? '';
      const date = dateInput ? parseUserDateToISO(dateInput, dateFormat) : null;
      if (!title) {
        setSaving(false);
        return;
      }
      if (!dateInput || !date) {
        setError(`Please enter the date as ${datePlaceholder}.`);
        setSaving(false);
        return;
      }
      let image: string;
      if (selectedFile) {
        const { url } = await uploadImage(selectedFile);
        image = url;
      } else {
        image = 'https://picsum.photos/400/400?random=memory';
      }
        await createMemory({ title, date, image, type: selectedType, description });
      await onSave();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const isText = kind === 'text';
  const submitLabel = saving ? 'Saving...' : isText ? 'Add to Cute Texts' : 'Save Memory Forever';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
          Capture a New Memory
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Save another beautiful moment in our journey together.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-6 md:p-12 border border-primary/20 dark:border-primary/30">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Kind selector at top */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
              What are you adding?
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="relative flex cursor-pointer group">
                <input
                  type="radio"
                  name="kind"
                  value="daily"
                  checked={kind === 'daily'}
                  onChange={() => { setKind('daily'); setSelectedType('daily'); }}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary transition-all duration-200 flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                  <span className="material-icons-round text-sm">auto_awesome</span>
                  Daily Memory
                </div>
              </label>
              <label className="relative flex cursor-pointer group">
                <input
                  type="radio"
                  name="kind"
                  value="milestone"
                  checked={kind === 'milestone'}
                  onChange={() => { setKind('milestone'); setSelectedType('milestone'); }}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary transition-all duration-200 flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                  <span className="material-icons-round text-sm">stars</span>
                  Milestone
                </div>
              </label>
              <label className="relative flex cursor-pointer group">
                <input
                  type="radio"
                  name="kind"
                  value="text"
                  checked={kind === 'text'}
                  onChange={() => setKind('text')}
                  className="sr-only peer"
                />
                <div className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary transition-all duration-200 flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                  <span className="material-icons-round text-sm">chat_bubble</span>
                  Cute Text
                </div>
              </label>
            </div>
          </div>

          {/* Photo area – hidden when Cute Text */}
          {!isText && (
            <div className="group relative bg-primary/5 dark:bg-primary/10 border-2 border-dashed border-primary/30 dark:border-primary/20 rounded-2xl h-64 flex items-center justify-center text-center transition-all hover:border-primary overflow-hidden">
              <input
                type="file"
                id="memory-image"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-6">
                  <span className="material-icons-round text-5xl text-primary mb-3 group-hover:scale-110 transition-transform" style={{ color: 'var(--color-primary)' }}>add_a_photo</span>
                  <h3 className="text-lg font-semibold text-primary">Upload a Photo</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Drag and drop or click to browse</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                  <p className="text-white font-bold">Click to change</p>
                </div>
              )}
            </div>
          )}

          {/* Cute text fields – only when Cute Text */}
          {isText && (
            <>
              <div className="space-y-2">
                <label htmlFor="cute-text" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                  Message
                </label>
                <textarea
                  id="cute-text"
                  rows={4}
                  placeholder="The sweet message you want to save..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="cute-sender" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                    From
                  </label>
                  <select
                    id="cute-sender"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  >
                    <option value="ME">Me</option>
                    <option value="PARTNER">Partner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="cute-date" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                    Date (optional)
                  </label>
                  <input
                    type="text"
                    id="cute-date"
                    placeholder={datePlaceholder}
                    value={cuteDate}
                    onChange={(e) => setCuteDate(formatDateInputMask(e.target.value))}
                    maxLength={10}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <span className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">Card style</span>
                <div className="flex flex-wrap gap-4">
                  <label className="relative flex cursor-pointer group">
                    <input type="radio" name="cute-color" value="white" defaultChecked className="sr-only peer" />
                    <div className="px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 peer-checked:border-primary bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all">
                      White card
                    </div>
                  </label>
                  <label className="relative flex cursor-pointer group">
                    <input type="radio" name="cute-color" value="primary" className="sr-only peer" />
                    <div className="px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 peer-checked:border-primary bg-primary/10 text-primary flex items-center gap-2 transition-all">
                      Primary card
                    </div>
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" id="cute-favorite" defaultChecked className="w-5 h-5 rounded text-primary focus:ring-primary" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Show as favorite (star)</span>
              </label>
            </>
          )}

          {/* Memory fields – only when Daily or Milestone */}
          {!isText && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                    Memory Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    placeholder="A special day at the beach..."
                    required
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                    When did this happen?
                  </label>
                  <div className="relative">
                    <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 opacity-60" style={{ color: 'var(--color-primary)' }}>calendar_today</span>
                    <input
                      type="text"
                      id="date"
                      placeholder={datePlaceholder}
                      required
                      value={memoryDate}
                      onChange={(e) => setMemoryDate(formatDateInputMask(e.target.value))}
                      maxLength={10}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-primary uppercase tracking-wider ml-1">
                  Write something cute...
                </label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Tell the story of this beautiful moment..."
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white resize-none"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm font-medium" role="alert">{error}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-on-primary py-5 rounded-2xl font-bold text-lg hover:bg-opacity-90 transform transition hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              <span className="material-icons-round">{saving ? 'hourglass_empty' : 'favorite'}</span>
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-5 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <footer className="mt-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <span>Made with</span>
        <span className="material-icons-round text-primary text-base animate-pulse">favorite</span>
        <span>by Us, for Us</span>
      </footer>
    </div>
  );
};

export default AddMemory;
