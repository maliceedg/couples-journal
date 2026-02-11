import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, updateJournalPreferences, getApiErrorMessage } from '../api';
import { ACCENT_COLORS } from '../constants/colors';
import { formatDateByPreference, formatDateInputMask, parseUserDateToISO, isDateAfterToday } from '../utils/dateHelpers';
import { parseSongUrl, isValidSongUrl } from '../utils/songUrl';
import type { UserProfile } from '../types';
import type { JournalData, DateFormatPreference } from '../types';

interface ProfileViewProps {
  journal: JournalData | null;
  journalLoading: boolean;
  onBack: () => void;
  onPreferencesSaved: (journal: JournalData) => void;
}

const Profile: React.FC<ProfileViewProps> = ({ journal, journalLoading, onBack, onPreferencesSaved }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('');
  const [resetPasswordMessage, setResetPasswordMessage] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>(journal?.accentColor ?? '#A56CB9');
  const [dateFormat, setDateFormat] = useState<DateFormatPreference>(journal?.dateFormat ?? 'DMY');
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [anniversarySaving, setAnniversarySaving] = useState(false);
  const [anniversarySuccess, setAnniversarySuccess] = useState(false);
  const [anniversaryError, setAnniversaryError] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState(journal?.songUrl ?? '');
  const [songSaving, setSongSaving] = useState(false);
  const [songSuccess, setSongSuccess] = useState(false);
  const [songError, setSongError] = useState<string | null>(null);

  useEffect(() => {
    if (journal) {
      setAccentColor(journal.accentColor ?? '#A56CB9');
      setDateFormat(journal.dateFormat ?? 'DMY');
      const iso = journal.startDate?.slice(0, 10) ?? '';
      setAnniversaryDate(iso ? formatDateByPreference(iso, journal.dateFormat ?? 'DMY') : '');
      setSongUrl(journal.songUrl ?? '');
    }
  }, [journal]);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setFirstName(p.firstName ?? '');
        setLastName(p.lastName ?? '');
        setPhone(p.phone ?? '');
        setTimezone(p.timezone ?? '');
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to load profile')))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      const updated = await updateProfile({ firstName: firstName.trim() || null, lastName: lastName.trim() || null, phone: phone.trim() || null, timezone: timezone.trim() || null });
      setProfile(updated);
      setSaveSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    setResetPasswordMessage('Password reset will be available when auth is enabled.');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4">
        <span className="material-icons-round text-primary text-5xl animate-pulse">person</span>
        <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
      </div>
    );
  }
  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center justify-center gap-4 text-center">
        <span className="material-icons-round text-red-500 text-5xl">error_outline</span>
        <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
        <button type="button" onClick={onBack} className="mt-4 text-primary font-semibold hover:underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 animate-fade-in">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary font-medium mb-8"
      >
        <span className="material-icons-round">arrow_back</span>
        Back
      </button>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
          Profile
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View and update your information. Phone will be used for future sign-in.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-6 md:p-10 border border-slate-100 dark:border-slate-700 space-y-8">
        {profile && (
          <>
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-600">
              <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-icons-round text-4xl">person</span>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-semibold text-slate-800 dark:text-white">{profile.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="profile-firstName" className="block text-sm font-semibold text-primary uppercase tracking-wider">
                    First name
                  </label>
                  <input
                    id="profile-firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-lastName" className="block text-sm font-semibold text-primary uppercase tracking-wider">
                    Last name
                  </label>
                  <input
                    id="profile-lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-phone" className="block text-sm font-semibold text-primary uppercase tracking-wider">
                  Phone number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="For future OTP sign-in"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Used for future one-time password (OTP) authentication.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-timezone" className="block text-sm font-semibold text-primary uppercase tracking-wider">
                  Time zone
                </label>
                <select
                  id="profile-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                >
                  <option value="">Use device time zone</option>
                  <option value="America/Caracas">Venezuela Time (VET, UTC-4)</option>
                  <option value="America/New_York">Eastern Time (ET, US)</option>
                  <option value="America/Chicago">Central Time (CT, US)</option>
                  <option value="America/Denver">Mountain Time (MT, US)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT, US)</option>
                  <option value="America/Mexico_City">Central Mexico (CST)</option>
                  <option value="America/Bogota">Colombia Time (COT)</option>
                  <option value="America/Lima">Peru Time (PET)</option>
                  <option value="America/Sao_Paulo">Brasília Time (BRT)</option>
                  <option value="Europe/London">UK (GMT/BST)</option>
                  <option value="Europe/Paris">Central European (CET)</option>
                  <option value="Europe/Madrid">Spain (CET)</option>
                  <option value="Asia/Tokyo">Japan (JST)</option>
                  <option value="Asia/Shanghai">China (CST)</option>
                  <option value="Australia/Sydney">Australia Eastern (AEST)</option>
                  <option value="UTC">UTC</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400">Used for date calculations (e.g. Time Together, anniversaries).</p>
              </div>

              {error && <p className="text-red-500 text-sm font-medium" role="alert">{error}</p>}
              {saveSuccess && <p className="text-green-600 dark:text-green-400 text-sm font-medium" role="status">Profile saved.</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span className="material-icons-round text-lg">{saving ? 'hourglass_empty' : 'save'}</span>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>

            {/* Anniversary date (relationship start) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-600 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Anniversary date</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                When did your relationship start? This powers the Time Together and Anniversary views.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60 pointer-events-none">calendar_today</span>
                  <input
                    type="text"
                    value={anniversaryDate}
                    onChange={(e) => { setAnniversaryDate(formatDateInputMask(e.target.value)); setAnniversaryError(null); setAnniversarySuccess(false); }}
                    placeholder={dateFormat === 'DMY' ? 'dd/mm/yyyy' : 'mm/dd/yyyy'}
                    maxLength={10}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setAnniversarySaving(true);
                    setAnniversarySuccess(false);
                    setAnniversaryError(null);
                    try {
                      const startDateIso = anniversaryDate.trim() ? parseUserDateToISO(anniversaryDate, dateFormat) : undefined;
                      if (startDateIso != null && isDateAfterToday(startDateIso)) {
                        setAnniversaryError('Relationship start date cannot be in the future.');
                        setAnniversarySaving(false);
                        return;
                      }
                      const updated = await updateJournalPreferences({
                        ...(startDateIso != null && { startDate: startDateIso }),
                      });
                      onPreferencesSaved(updated);
                      setAnniversarySuccess(true);
                    } catch (err) {
                      setAnniversaryError(getApiErrorMessage(err, 'Failed to save anniversary date'));
                    } finally {
                      setAnniversarySaving(false);
                    }
                  }}
                  disabled={anniversarySaving}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors font-semibold disabled:opacity-60"
                >
                  <span className="material-icons-round text-lg">{anniversarySaving ? 'hourglass_empty' : 'save'}</span>
                  {anniversarySaving ? 'Saving…' : 'Save anniversary date'}
                </button>
              </div>
              {anniversarySuccess && <p className="text-sm text-green-600 dark:text-green-400">Anniversary date saved.</p>}
              {anniversaryError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{anniversaryError}</p>}
            </div>

            {/* Our Song */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-600 space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Our Song</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Paste a YouTube or Spotify track link. It will appear on your Relationship Wrapped card and you can listen here.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="url"
                  value={songUrl}
                  onChange={(e) => { setSongUrl(e.target.value); setSongError(null); setSongSuccess(false); }}
                  placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..."
                  className="flex-1 min-w-[200px] px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none dark:text-white text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setSongSaving(true);
                    setSongSuccess(false);
                    setSongError(null);
                    try {
                      const value = songUrl.trim() || null;
                      if (value != null && !isValidSongUrl(value)) {
                        setSongError('Please enter a valid YouTube or Spotify track/album/playlist link.');
                        setSongSaving(false);
                        return;
                      }
                      const updated = await updateJournalPreferences({ songUrl: value });
                      onPreferencesSaved(updated);
                      setSongSuccess(true);
                    } catch (err) {
                      setSongError(getApiErrorMessage(err, 'Failed to save song'));
                    } finally {
                      setSongSaving(false);
                    }
                  }}
                  disabled={songSaving}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors font-semibold disabled:opacity-60"
                >
                  <span className="material-icons-round text-lg">{songSaving ? 'hourglass_empty' : 'music_note'}</span>
                  {songSaving ? 'Saving…' : 'Save song'}
                </button>
              </div>
              {songError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{songError}</p>}
              {songSuccess && <p className="text-sm text-green-600 dark:text-green-400">Song link saved.</p>}
              {journal?.songUrl?.trim() && !songSaving && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tip: Click &quot;Save song&quot; again to refresh title and artist (e.g. after adding Spotify credentials).
                </p>
              )}
              {(() => {
                const urlToShow = songUrl.trim() || journal?.songUrl || '';
                const parsed = parseSongUrl(urlToShow);
                const savedTitle = journal?.songTitle?.trim();
                const savedArtist = journal?.songArtist?.trim();
                const savedLabel = savedArtist && savedTitle ? `${savedArtist} – ${savedTitle}` : savedTitle || null;
                if (!parsed) return null;
                return (
                  <div className="mt-4 space-y-2 w-full min-w-0">
                    {savedLabel && (
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {savedLabel}
                      </p>
                    )}
                    <div
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 w-full"
                      style={{ minHeight: parsed.type === 'youtube' ? 225 : 152 }}
                    >
                      {parsed.type === 'youtube' ? (
                        <iframe
                          key={parsed.embedUrl}
                          title="Our Song (YouTube)"
                          src={`${parsed.embedUrl}?rel=0`}
                          className="w-full border-0 block"
                          style={{ width: '100%', height: 225, minHeight: 225 }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <iframe
                          key={parsed.embedUrl}
                          title="Our Song (Spotify)"
                          src={`${parsed.embedUrl}?utm_source=oembed`}
                          className="w-full border-0 block"
                          style={{ width: '100%', height: 152, minHeight: 152 }}
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      If the player doesn’t load,{' '}
                      <a
                        href={parsed.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-medium underline"
                      >
                        open in {parsed.type === 'youtube' ? 'YouTube' : 'Spotify'}
                      </a>
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Display preferences (couple) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-600 space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Display preferences</h2>
              {journalLoading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Accent color</p>
                    <div className="flex flex-wrap gap-3">
                      {ACCENT_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setAccentColor(c.hex)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            (accentColor?.toLowerCase() === c.hex.toLowerCase())
                              ? 'border-slate-800 dark:border-white scale-110'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-400'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                          aria-label={`Select ${c.label}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Date format</p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateFormat"
                          checked={dateFormat === 'DMY'}
                          onChange={() => setDateFormat('DMY')}
                          className="w-4 h-4 focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span className="text-slate-700 dark:text-slate-300">DD/MM/YYYY</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="dateFormat"
                          checked={dateFormat === 'MDY'}
                          onChange={() => setDateFormat('MDY')}
                          className="w-4 h-4 focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span className="text-slate-700 dark:text-slate-300">MM/DD/YYYY</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setPrefsSaving(true);
                      setPrefsSuccess(false);
                      setPrefsError(null);
                      try {
                        const updated = await updateJournalPreferences({
                          accentColor: accentColor || null,
                          dateFormat,
                        });
                        onPreferencesSaved(updated);
                        setPrefsSuccess(true);
                      } catch (err) {
                        setPrefsError(getApiErrorMessage(err, 'Failed to save preferences'));
                      } finally {
                        setPrefsSaving(false);
                      }
                    }}
                    disabled={prefsSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors font-semibold disabled:opacity-60"
                  >
                    <span className="material-icons-round text-lg">{prefsSaving ? 'hourglass_empty' : 'palette'}</span>
                    {prefsSaving ? 'Saving…' : 'Save display preferences'}
                  </button>
                  {prefsSuccess && <p className="text-sm text-green-600 dark:text-green-400">Preferences saved.</p>}
                  {prefsError && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{prefsError}</p>}
                </>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-600">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Password</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Reset your password when you sign in with email. This will be available once auth is enabled.
              </p>
              <button
                type="button"
                onClick={handleResetPassword}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium"
              >
                <span className="material-icons-round">lock_reset</span>
                Reset password
              </button>
              {resetPasswordMessage && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400" role="status">{resetPasswordMessage}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
