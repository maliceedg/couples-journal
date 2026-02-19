import { prisma } from './db.js';

const userSelect = { id: true, firstName: true, lastName: true, name: true };

const journalInclude = {
  memories: { orderBy: { date: 'desc' as const } },
  milestones: { orderBy: { date: 'desc' as const } },
  cuteTexts: { orderBy: { createdAt: 'desc' as const } },
  chatStats: true,
  user: { select: userSelect },
  members: { include: { user: { select: userSelect } } },
} as const;

/** Resolve the journal the user has access to (owner or partner). */
export async function findJournalForUser(userId: string) {
  const asOwner = await prisma.journal.findFirst({
    where: { userId },
    include: journalInclude,
  });
  if (asOwner) return asOwner;
  const membership = await prisma.journalMember.findFirst({
    where: { userId },
    include: {
      journal: { include: journalInclude },
    },
  });
  return membership?.journal ?? null;
}

function displayName(u: { firstName: string | null; lastName: string | null; name: string | null }): string | null {
  const first = u.firstName?.trim();
  const last = u.lastName?.trim();
  if (first || last) return [first, last].filter(Boolean).join(' ').trim() || null;
  return u.name?.trim() || null;
}

/** Current user's display info for the journal (owner or member). */
export function getCurrentUserDisplay(
  journal: {
    userId?: string;
    user?: { id: string; firstName: string | null; lastName: string | null; name: string | null };
    members?: Array<{ user: { id: string; firstName: string | null; lastName: string | null; name: string | null } }>;
  },
  currentUserId: string
): { id: string; displayName: string; firstName: string | null } | null {
  if (journal.user && journal.user.id === currentUserId) {
    const name = displayName(journal.user);
    const firstName = journal.user.firstName?.trim() || null;
    return { id: journal.user.id, displayName: name?.trim() || 'Me', firstName };
  }
  const member = journal.members?.find((m) => m.user.id === currentUserId);
  if (member?.user) {
    const name = displayName(member.user);
    const firstName = member.user.firstName?.trim() || null;
    return { id: member.user.id, displayName: name?.trim() || 'Me', firstName };
  }
  return null;
}

/** Partner display name: live partner user's name if they've joined, else stored partnerDisplayName. */
export function getPartnerName(
  journal: {
    partnerDisplayName: string | null;
    userId?: string;
    user?: { id: string; firstName: string | null; lastName: string | null; name: string | null };
    members?: Array<{ user: { id: string; firstName: string | null; lastName: string | null; name: string | null } }>;
  },
  currentUserId: string
): string | null {
  if (journal.user && journal.user.id !== currentUserId) {
    const name = displayName(journal.user);
    if (name) return name;
  }
  const members = journal.members ?? [];
  const partnerMember = members.find((m) => m.user.id !== currentUserId);
  if (partnerMember?.user) {
    const name = displayName(partnerMember.user);
    if (name) return name;
  }
  return journal.partnerDisplayName?.trim() || null;
}

/** Partner's first name (for card author display). */
export function getPartnerFirstName(
  journal: {
    partnerDisplayName: string | null;
    userId?: string;
    user?: { id: string; firstName: string | null; lastName: string | null; name: string | null };
    members?: Array<{ user: { id: string; firstName: string | null; lastName: string | null; name: string | null } }>;
  },
  currentUserId: string
): string | null {
  if (journal.user && journal.user.id !== currentUserId) {
    const first = journal.user.firstName?.trim();
    if (first) return first;
  }
  const partnerMember = journal.members?.find((m) => m.user.id !== currentUserId);
  if (partnerMember?.user?.firstName?.trim()) return partnerMember.user.firstName.trim();
  const full = getPartnerName(journal, currentUserId);
  if (full) {
    const firstWord = full.trim().split(/\s+/)[0];
    if (firstWord) return firstWord;
  }
  return null;
}

export { journalInclude };
