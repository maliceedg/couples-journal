import { Router, Response } from 'express';
import { prisma } from '../db.js';

export const journalRouter = Router();

function getUserId(res: Response): string {
  return (res.locals as { userId: string }).userId;
}

// GET /api/journal – current user's journal (with display preferences)
journalRouter.get('/', async (_req, res) => {
  try {
    const userId = getUserId(res);
    const journal = await prisma.journal.findFirst({
      where: { userId },
      include: {
        memories: { orderBy: { date: 'desc' } },
        milestones: { orderBy: { date: 'asc' } },
        cuteTexts: { orderBy: { createdAt: 'desc' } },
        chatStats: true,
      },
    });
    if (!journal) {
      return res.status(404).json({ error: 'No journal found for this account.' });
    }
    res.json({
      id: journal.id,
      name: journal.name,
      startDate: journal.startDate.toISOString(),
      accentColor: journal.accentColor ?? '#A56CB9',
      dateFormat: journal.dateFormat ?? 'DMY',
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
      })),
      chatStats: journal.chatStats.map((s) => ({
        id: s.id,
        icon: s.icon,
        value: s.value,
        label: s.label,
        subLabel: s.subLabel ?? undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load journal' });
  }
});

// PATCH /api/journal – update journal preferences (accentColor, dateFormat)
journalRouter.patch('/', async (req, res) => {
  try {
    const userId = getUserId(res);
    const journal = await prisma.journal.findFirst({ where: { userId }, select: { id: true } });
    if (!journal) return res.status(404).json({ error: 'No journal found' });
    const { accentColor, dateFormat, startDate: startDateRaw } = req.body as {
      accentColor?: string | null;
      dateFormat?: string | null;
      startDate?: string | null;
    };
    let startDateValue: Date | undefined;
    if (startDateRaw != null && typeof startDateRaw === 'string' && startDateRaw.trim()) {
      const parsed = new Date(startDateRaw.trim());
      if (!Number.isNaN(parsed.getTime())) startDateValue = parsed;
    }
    const updated = await prisma.journal.update({
      where: { id: journal.id },
      data: {
        ...(accentColor !== undefined && { accentColor: accentColor?.trim() || null }),
        ...(dateFormat !== undefined && {
          dateFormat: dateFormat === 'DMY' || dateFormat === 'MDY' ? dateFormat : null,
        }),
        ...(startDateValue !== undefined && { startDate: startDateValue }),
      },
      include: {
        memories: { orderBy: { date: 'desc' } },
        milestones: { orderBy: { date: 'asc' } },
        cuteTexts: { orderBy: { createdAt: 'desc' } },
        chatStats: true,
      },
    });
    res.json({
      id: updated.id,
      name: updated.name,
      startDate: updated.startDate.toISOString(),
      accentColor: updated.accentColor ?? '#A56CB9',
      dateFormat: updated.dateFormat ?? 'DMY',
      memories: updated.memories.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        image: m.imageUrl,
        type: m.type,
        description: m.description,
      })),
      milestones: updated.milestones.map((m) => ({
        id: m.id,
        date: m.date,
        title: m.title,
        description: m.description,
      })),
      cuteTexts: updated.cuteTexts.map((t) => ({
        id: t.id,
        text: t.text,
        sender: t.sender,
        date: t.date,
        isFavorite: t.isFavorite,
        color: t.color as 'white' | 'primary',
      })),
      chatStats: updated.chatStats.map((s) => ({
        id: s.id,
        icon: s.icon,
        value: s.value,
        label: s.label,
        subLabel: s.subLabel ?? undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update journal' });
  }
});
