import type { JournalData, Memory, TextMessage, UserProfile } from './types';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const TOKEN_KEY = 'lovestory_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Use for memory images: full URL for uploads (e.g. /uploads/xxx) or external URLs as-is */
export function memoryImageUrl(image: string): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${API_BASE}${image.startsWith('/') ? '' : '/'}${image}`;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

/** User-friendly message for API errors (e.g. offline / network failure). */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message?.includes('network'))) {
    return 'Connection failed. Please check your network and try again.';
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null };
  journal: JournalData;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  return handleResponse<LoginResponse>(res);
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  journalName: string;
  startDate?: string; // YYYY-MM-DD optional
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      firstName: payload.firstName?.trim() || undefined,
      lastName: payload.lastName?.trim() || undefined,
      journalName: payload.journalName.trim(),
      startDate: payload.startDate || undefined,
    }),
  });
  return handleResponse<LoginResponse>(res);
}

export async function getJournal(): Promise<JournalData> {
  const res = await fetch(`${API_BASE}/api/journal`, { headers: authHeaders() });
  return handleResponse<JournalData>(res);
}

export async function updateJournalPreferences(data: {
  accentColor?: string | null;
  dateFormat?: 'DMY' | 'MDY' | null;
  startDate?: string | null;
  songUrl?: string | null;
}): Promise<JournalData> {
  const res = await fetch(`${API_BASE}/api/journal`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<JournalData>(res);
}

export async function createMemory(data: {
  title: string;
  date: string;
  image: string;
  type: 'daily' | 'milestone';
  description?: string;
}): Promise<Memory> {
  const res = await fetch(`${API_BASE}/api/memories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<Memory>(res);
}

export async function uploadImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: authHeaders(), body: form });
  return handleResponse<{ url: string }>(res);
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/memories/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Failed to delete memory');
  }
}

export async function createCuteText(data: {
  text: string;
  sender: string;
  date?: string;
  isFavorite?: boolean;
  color?: 'white' | 'primary';
}): Promise<TextMessage> {
  const res = await fetch(`${API_BASE}/api/cute-texts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<TextMessage>(res);
}

export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, { headers: authHeaders() });
  return handleResponse<UserProfile>(res);
}

export async function updateProfile(data: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  timezone?: string | null;
}): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfile>(res);
}
