export type ViewState = 'login' | 'dashboard' | 'add-memory' | 'anniversary' | 'memory-detail' | 'cute-texts' | 'profile';

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  timezone?: string | null;
  createdAt: string;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  image: string;
  type: 'daily' | 'milestone';
  description: string;
}

export interface ChatStat {
  id?: string;
  icon: string;
  value: string;
  label: string;
  subLabel?: string;
}

export interface TextMessage {
  id: string;
  text: string;
  sender: string;
  date: string;
  isFavorite: boolean;
  color: 'white' | 'primary';
}

export interface Milestone {
  id?: string;
  date: string;
  title: string;
  description: string;
}

export type DateFormatPreference = 'DMY' | 'MDY'; // dd/mm/yyyy | mm/dd/yyyy

export interface JournalData {
  id: string;
  name: string;
  startDate: string;
  accentColor?: string;
  dateFormat?: DateFormatPreference;
  memories: Memory[];
  milestones: Milestone[];
  cuteTexts: TextMessage[];
  chatStats: ChatStat[];
}
