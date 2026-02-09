import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { signToken } from '../middleware/auth.js';

export const authRouter = Router();

function serializeJournal(journal: {
  id: string;
  name: string;
  startDate: Date;
  accentColor: string | null;
  dateFormat: string | null;
  memories: Array<{ id: string; title: string; date: string; imageUrl: string; type: string; description: string }>;
  milestones: Array<{ id: string; date: string; title: string; description: string }>;
  cuteTexts: Array<{ id: string; text: string; sender: string; date: string; isFavorite: boolean; color: string }>;
  chatStats: Array<{ id: string; icon: string; value: string; label: string; subLabel: string | null }>;
}) {
  return {
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
  };
}

// Simple email format check
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const body = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      journalName?: string;
      startDate?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const journalName = body.journalName?.trim();
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!journalName) {
      return res.status(400).json({ error: 'Journal name is required (e.g. "Carla & Edgardo")' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const startDate = body.startDate
      ? new Date(body.startDate)
      : new Date();
    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: body.firstName?.trim() || null,
        lastName: body.lastName?.trim() || null,
      },
    });
    const journal = await prisma.journal.create({
      data: {
        userId: user.id,
        name: journalName,
        startDate,
        accentColor: '#A56CB9',
        dateFormat: 'DMY',
      },
      include: {
        memories: { orderBy: { date: 'desc' } },
        milestones: { orderBy: { date: 'asc' } },
        cuteTexts: { orderBy: { createdAt: 'desc' } },
        chatStats: true,
      },
    });
    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      journal: serializeJournal(journal),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        journal: {
          include: {
            memories: { orderBy: { date: 'desc' } },
            milestones: { orderBy: { date: 'asc' } },
            cuteTexts: { orderBy: { createdAt: 'desc' } },
            chatStats: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const journal = user.journal;
    if (!journal) {
      return res.status(403).json({ error: 'No journal linked to this account' });
    }
    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      journal: serializeJournal(journal),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});
