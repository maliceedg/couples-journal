import crypto from 'node:crypto';
import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { fetchSongMetadata } from '../songTitle.js';
import { findJournalForUser, getPartnerName, getCurrentUserDisplay, getPartnerFirstName } from '../journalHelpers.js';

export const journalRouter = Router();

function getUserId(res: Response): string {
  return (res.locals as { userId: string }).userId;
}

function mapJournalToJson(journal: Awaited<ReturnType<typeof findJournalForUser>>, currentUserId: string) {
  if (!journal) return null;
  const partnerName = getPartnerName(journal, currentUserId);
  const currentUser = getCurrentUserDisplay(journal, currentUserId);
  const partnerFirstName = getPartnerFirstName(journal, currentUserId);
  return {
    id: journal.id,
    name: journal.name,
    startDate: journal.startDate.toISOString(),
    accentColor: journal.accentColor ?? '#A56CB9',
    dateFormat: journal.dateFormat ?? 'DMY',
    songUrl: journal.songUrl ?? undefined,
    songTitle: journal.songTitle ?? undefined,
    songArtist: journal.songArtist ?? undefined,
    partnerName: partnerName ?? undefined,
    partnerDisplayName: journal.partnerDisplayName ?? undefined,
    partnerFirstName: partnerFirstName ?? undefined,
    currentUser: currentUser ?? undefined,
    memories: journal.memories.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      image: m.imageUrl,
      type: m.type,
      description: m.description,
    })),
    milestones: journal.milestones.map((m) => ({
      id: m.id,
      date: m.date,
      title: m.title,
      description: m.description,
    })),
    cuteTexts: journal.cuteTexts.map((t) => ({
      id: t.id,
      text: t.text,
      sender: t.sender,
      date: t.date,
      isFavorite: t.isFavorite,
      color: t.color as 'white' | 'primary',
      createdByUserId: t.userId ?? undefined,
    })),
    chatStats: journal.chatStats.map((s) => ({
      id: s.id,
      icon: s.icon,
      value: s.value,
      label: s.label,
      subLabel: s.subLabel ?? undefined,
    })),
  };
}

// GET /api/journal – current user's journal (owner or partner)
journalRouter.get('/', async (_req, res) => {
  try {
    const userId = getUserId(res);
    const journal = await findJournalForUser(userId);
    if (!journal) {
      return res.status(404).json({ error: 'No journal found for this account.' });
    }
    res.json(mapJournalToJson(journal, userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load journal' });
  }
});

// PATCH /api/journal – update journal preferences (accentColor, dateFormat, partnerDisplayName, etc.)
journalRouter.patch('/', async (req, res) => {
  try {
    const userId = getUserId(res);
    const journal = await findJournalForUser(userId);
    if (!journal) return res.status(404).json({ error: 'No journal found' });
    const {
      accentColor,
      dateFormat,
      startDate: startDateRaw,
      songUrl: songUrlRaw,
      partnerDisplayName: partnerDisplayNameRaw,
    } = req.body as {
      accentColor?: string | null;
      dateFormat?: string | null;
      startDate?: string | null;
      songUrl?: string | null;
      partnerDisplayName?: string | null;
    };
    let startDateValue: Date | undefined;
    if (startDateRaw != null && typeof startDateRaw === 'string' && startDateRaw.trim()) {
      const parsed = new Date(startDateRaw.trim());
      if (!Number.isNaN(parsed.getTime())) {
        const today = new Date();
        const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
        const startStart = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
        if (startStart > todayStart) {
          return res.status(400).json({ error: 'Relationship start date cannot be in the future.' });
        }
        startDateValue = parsed;
      }
    }
    let songTitleValue: string | null | undefined;
    let songArtistValue: string | null | undefined;
    if (songUrlRaw !== undefined) {
      const url = songUrlRaw?.trim() || null;
      if (url) {
        const meta = await fetchSongMetadata(url);
        songTitleValue = meta.title;
        songArtistValue = meta.artist;
      } else {
        songTitleValue = null;
        songArtistValue = null;
      }
    }

    const updated = await prisma.journal.update({
      where: { id: journal.id },
      data: {
        ...(accentColor !== undefined && { accentColor: accentColor?.trim() || null }),
        ...(dateFormat !== undefined && {
          dateFormat: dateFormat === 'DMY' || dateFormat === 'MDY' ? dateFormat : null,
        }),
        ...(startDateValue !== undefined && { startDate: startDateValue }),
        ...(songUrlRaw !== undefined && { songUrl: songUrlRaw?.trim() || null }),
        ...(songTitleValue !== undefined && { songTitle: songTitleValue }),
        ...(songArtistValue !== undefined && { songArtist: songArtistValue }),
        ...(partnerDisplayNameRaw !== undefined && {
          partnerDisplayName: partnerDisplayNameRaw?.trim() || null,
        }),
      },
      include: {
        memories: { orderBy: { date: 'desc' } },
        milestones: { orderBy: { date: 'desc' } },
        cuteTexts: { orderBy: { createdAt: 'desc' } },
        chatStats: true,
        user: { select: { id: true, firstName: true, lastName: true, name: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, name: true } } } },
      },
    });
    res.json(mapJournalToJson(updated, userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update journal' });
  }
});

const INVITE_EXPIRY_DAYS = 7;

// POST /api/journal/invite – create invite link/code (owner or partner can invite)
journalRouter.post('/invite', async (_req, res) => {
  try {
    const userId = getUserId(res);
    const journal = await findJournalForUser(userId);
    if (!journal) return res.status(404).json({ error: 'No journal found' });
    const token = crypto.randomBytes(12).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
    await prisma.journalInvite.create({
      data: { token, journalId: journal.id, expiresAt },
    });
    res.status(201).json({ token, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// POST /api/journal/join – join a journal with an invite token (e.g. from register or later)
journalRouter.post('/join', async (req, res) => {
  try {
    const userId = getUserId(res);
    const { token } = req.body as { token?: string };
    const inviteToken = token?.trim();
    if (!inviteToken) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }
    const invite = await prisma.journalInvite.findUnique({
      where: { token: inviteToken },
      include: { journal: true },
    });
    if (!invite) {
      return res.status(400).json({ error: 'Invalid or expired invite code.' });
    }
    if (invite.usedAt) {
      return res.status(400).json({ error: 'This invite has already been used.' });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This invite has expired.' });
    }
    const existing = await prisma.journalMember.findUnique({
      where: { journalId_userId: { journalId: invite.journalId, userId } },
    });
    if (existing) {
      return res.status(400).json({ error: 'You are already in this journal.' });
    }
    if (invite.journal.userId === userId) {
      return res.status(400).json({ error: 'You already own this journal.' });
    }
    await prisma.$transaction([
      prisma.journalMember.create({
        data: { journalId: invite.journalId, userId },
      }),
      prisma.journalInvite.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);
    const journal = await findJournalForUser(userId);
    if (!journal) return res.status(500).json({ error: 'Failed to load journal' });
    res.json(mapJournalToJson(journal, userId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to join journal' });
  }
});
