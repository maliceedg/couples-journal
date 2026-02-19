import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { signToken } from '../middleware/auth.js';
import { findJournalForUser, getPartnerName, getCurrentUserDisplay, getPartnerFirstName } from '../journalHelpers.js';
import { sendPasswordResetEmail } from '../sendPasswordResetEmail.js';

export const authRouter = Router();

function serializeJournal(
  journal: {
    id: string;
    name: string;
    startDate: Date;
    accentColor: string | null;
    dateFormat: string | null;
    songUrl: string | null;
    songTitle: string | null;
    songArtist: string | null;
    partnerDisplayName: string | null;
    userId?: string;
    user?: { id: string; firstName: string | null; lastName: string | null; name: string | null };
    members?: Array<{ user: { id: string; firstName: string | null; lastName: string | null; name: string | null } }>;
    memories: Array<{ id: string; title: string; date: string; imageUrl: string; type: string; description: string }>;
    milestones: Array<{ id: string; date: string; title: string; description: string }>;
    cuteTexts: Array<{ id: string; text: string; sender: string; date: string; isFavorite: boolean; color: string; userId?: string | null }>;
    chatStats: Array<{ id: string; icon: string; value: string; label: string; subLabel: string | null }>;
  },
  currentUserId: string
) {
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
      inviteCode?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const inviteCode = body.inviteCode?.trim();
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in.' });
    }

    if (inviteCode) {
      const invite = await prisma.journalInvite.findUnique({
        where: { token: inviteCode },
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
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await bcrypt.hash(password, 10),
          firstName: body.firstName?.trim() || null,
          lastName: body.lastName?.trim() || null,
        },
      });
      await prisma.$transaction([
        prisma.journalMember.create({
          data: { journalId: invite.journalId, userId: user.id },
        }),
        prisma.journalInvite.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        }),
      ]);
      const journal = await findJournalForUser(user.id);
      if (!journal) {
        return res.status(500).json({ error: 'Failed to load journal after joining.' });
      }
      const token = signToken(user.id);
      return res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        journal: serializeJournal(journal, user.id),
      });
    }

    if (!journalName) {
      return res.status(400).json({ error: 'Journal name is required (e.g. "Carla & Edgardo")' });
    }
    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start date' });
    }
    const today = new Date();
    const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const startStart = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    if (startStart > todayStart) {
      return res.status(400).json({ error: 'Relationship start date cannot be in the future.' });
    }
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
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
        milestones: { orderBy: { date: 'desc' } },
        cuteTexts: { orderBy: { createdAt: 'desc' } },
        chatStats: true,
        user: { select: { id: true, firstName: true, lastName: true, name: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, name: true } } } },
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
      journal: serializeJournal(journal, user.id),
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
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const journal = await findJournalForUser(user.id);
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
      journal: serializeJournal(journal, user.id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

const RESET_TOKEN_EXPIRY_HOURS = 1;

// POST /api/auth/forgot-password – request a password reset email
authRouter.post('/forgot-password', async (req, res) => {
  try {
    console.info('[password-reset] Request received');
    const { email } = req.body as { email?: string };
    const raw = email?.trim().toLowerCase();
    if (!raw || !isValidEmail(raw)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const user = await prisma.user.findUnique({ where: { email: raw } });
    if (!user && process.env.NODE_ENV !== 'production') {
      console.info('[password-reset] No account found with this email (dev only):', raw);
    }
    if (user) {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });
      const baseUrl = process.env.APP_URL?.trim() || process.env.FRONTEND_URL?.trim() || '';
      const resetLink = baseUrl ? `${baseUrl.replace(/\/$/, '')}?reset=${token}` : '';
      if (resetLink) {
        console.info('[password-reset] Account found, sending email to:', user.email);
        await sendPasswordResetEmail(user.email, resetLink);
      } else {
        console.warn('[password-reset] APP_URL and FRONTEND_URL are not set; no reset link. Set APP_URL in .env and restart the server.');
      }
    }
    res.json({ message: 'If an account exists with this email, you will receive a password reset link shortly.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/reset-password – set new password using a reset token
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    const rawToken = token?.trim();
    if (!rawToken || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: rawToken },
      include: { user: true },
    });
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }
    if (record.usedAt) {
      return res.status(400).json({ error: 'This reset link has already been used. Please request a new one.' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    res.json({ message: 'Your password has been reset. You can now log in.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});
