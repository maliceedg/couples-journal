import { ChatStat, TextMessage, Milestone, Memory } from './types';

export const START_DATE = new Date('2021-06-15T00:00:00');

export const CHAT_STATS: ChatStat[] = [
  { icon: 'chat_bubble_outline', value: '170,254', label: 'Total Messages', subLabel: '(257.3/day)' },
  { icon: 'person_outline', value: 'Carla', label: 'Top Sender', subLabel: '86,021 messages' },
  { icon: 'schedule', value: '12 AM', label: 'Most Active Time', subLabel: '19,319 messages' },
];

export const CUTE_TEXTS: TextMessage[] = [
  {
    id: '1',
    text: "You are the best thing that ever happened to me. I'm so lucky to have you by my side.",
    sender: 'CARLA',
    date: 'Sep 12, 2023 • 11:45 PM',
    isFavorite: true,
    color: 'white',
  },
  {
    id: '2',
    text: "Every day I wake up and realize how much more I love you than the day before.",
    sender: 'ME',
    date: 'Oct 05, 2023 • 08:20 AM',
    isFavorite: true,
    color: 'primary',
  },
  {
    id: '3',
    text: "Don't forget to eat lunch! I'm thinking about you constantly today. ❤️",
    sender: 'CARLA',
    date: 'Nov 22, 2023 • 12:15 PM',
    isFavorite: true,
    color: 'white',
  },
  {
    id: '4',
    text: "Just saw a dog that looked like the one we want. It's a sign!",
    sender: 'CARLA',
    date: 'Dec 01, 2023 • 2:30 PM',
    isFavorite: false,
    color: 'white',
  },
];

export const MILESTONES: Milestone[] = [
  {
    date: 'June 15, 2021',
    title: 'First Hello',
    description: 'That awkward coffee shop meeting that changed everything.',
  },
  {
    date: 'August 12, 2021',
    title: 'Officially Us',
    description: 'When we finally decided to make it official under the stars.',
  },
  {
    date: 'Dec 24, 2022',
    title: 'First Christmas',
    description: 'Opening presents and realizing you were the best gift of all.',
  },
];

export const RECENT_MEMORIES: Memory[] = [
  {
    id: 'm1',
    title: 'Our first sunset at the beach 🌅',
    date: '2023-07-10',
    image: 'https://picsum.photos/400/400?random=1',
    type: 'daily',
    description: '',
  },
  {
    id: 'm2',
    title: 'The day you said "Yes" ✨',
    date: '2024-02-14',
    image: 'https://picsum.photos/400/400?random=2',
    type: 'milestone',
    description: '',
  },
  {
    id: 'm3',
    title: 'Sunday morning coffee rituals ☕',
    date: '2023-11-20',
    image: 'https://picsum.photos/400/400?random=3',
    type: 'daily',
    description: '',
  },
];