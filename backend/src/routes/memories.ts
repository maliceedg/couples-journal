import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { findJournalForUser } from '../journalHelpers.js';

export const memoriesRouter = Router();

function getUserId(res: Response): string {
  return (res.locals as { userId: string }).userId;
}

async function getJournalId(res: Response): Promise<string | null> {
  const userId = getUserId(res);
  const j = await findJournalForUser(userId);
  return j?.id ?? null;
}

// GET /api/memories
memoriesRouter.get('/', async (_req, res) => {
  try {
    const journalId = await getJournalId(res);
    if (!journalId) return res.status(404).json({ error: 'No journal found' });
    const list = await prisma.memory.findMany({
      where: { journalId },
      orderBy: { date: 'desc' },
    });
    res.json(
      list.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        image: m.imageUrl,
        type: m.type,
        description: m.description,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

// POST /api/memories
memoriesRouter.post('/', async (req, res) => {
  try {
    const journalId = await getJournalId(res);
    if (!journalId) return res.status(404).json({ error: 'No journal found' });
    const { title, date, image, type, description } = req.body as {
      title?: string;
      date?: string;
      image?: string;
      type?: 'daily' | 'milestone';
      description?: string;
    };
    if (!title || !date || !image || !type) {
      return res.status(400).json({ error: 'Missing required fields: title, date, image, type' });
    }
    const memory = await prisma.memory.create({
      data: {
        journalId,
        title,
        date,
        imageUrl: image,
        type,
        description: description ?? '',
      },
    });

    if (type === 'milestone') {
      await prisma.milestone.create({
        data: {
          journalId,
          title,
          date,
          description: description ?? '',
        },
      });
    }

    res.status(201).json({
      id: memory.id,
      title: memory.title,
      date: memory.date,
      image: memory.imageUrl,
      type: memory.type,
      description: memory.description,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// PATCH /api/memories/:id
memoriesRouter.patch('/:id', async (req, res) => {
  try {
    const { title, date, image, type, description } = req.body as {
      title?: string;
      date?: string;
      image?: string;
      type?: 'daily' | 'milestone';
      description?: string;
    };
    const updated = await prisma.memory.update({
      where: { id: req.params.id },
      data: {
        ...(title != null && { title }),
        ...(date != null && { date }),
        ...(image != null && { imageUrl: image }),
        ...(type != null && { type }),
        ...(description != null && { description }),
      },
    });
    res.json({
      id: updated.id,
      title: updated.title,
      date: updated.date,
      image: updated.imageUrl,
      type: updated.type,
      description: updated.description,
    });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      return res.status(404).json({ error: 'Memory not found' });
    }
    console.error(e);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE /api/memories/:id
memoriesRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.memory.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2025') {
      return res.status(404).json({ error: 'Memory not found' });
    }
    console.error(e);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});
