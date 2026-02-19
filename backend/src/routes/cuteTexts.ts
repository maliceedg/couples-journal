import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { findJournalForUser } from '../journalHelpers.js';

export const cuteTextsRouter = Router();

function getUserId(res: Response): string {
  return (res.locals as { userId: string }).userId;
}

async function getJournalId(res: Response): Promise<string | null> {
  const userId = getUserId(res);
  const j = await findJournalForUser(userId);
  return j?.id ?? null;
}

// POST /api/cute-texts
cuteTextsRouter.post('/', async (req, res) => {
  try {
    const journalId = await getJournalId(res);
    if (!journalId) return res.status(404).json({ error: 'No journal found' });
    const { text, sender, date, isFavorite, color } = req.body as {
      text?: string;
      sender?: string;
      date?: string;
      isFavorite?: boolean;
      color?: string;
    };
    if (!text || !sender) {
      return res.status(400).json({ error: 'Missing required fields: text, sender' });
    }
    const userId = getUserId(res);
    const cuteText = await prisma.cuteText.create({
      data: {
        journalId,
        userId,
        text: text.trim(),
        sender: sender.trim(),
        date: date?.trim() ?? (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; })(),
        isFavorite: isFavorite ?? true,
        color: color === 'primary' ? 'primary' : 'white',
      },
    });
    res.status(201).json({
      id: cuteText.id,
      text: cuteText.text,
      sender: cuteText.sender,
      date: cuteText.date,
      isFavorite: cuteText.isFavorite,
      color: cuteText.color as 'white' | 'primary',
      createdByUserId: cuteText.userId ?? undefined,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create cute text' });
  }
});
