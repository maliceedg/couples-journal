import { Router, Response } from 'express';
import { prisma } from '../db.js';

export const profileRouter = Router();

function getUserId(res: Response): string {
  return (res.locals as { userId: string }).userId;
}

// GET /api/profile – current user's profile
profileRouter.get('/', async (_req, res) => {
  try {
    const userId = getUserId(res);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// PATCH /api/profile – update profile fields
profileRouter.patch('/', async (req, res) => {
  try {
    const userId = getUserId(res);
    const { firstName, lastName, phone, timezone } = req.body as {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      timezone?: string | null;
    };
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName: firstName?.trim() || null }),
        ...(lastName !== undefined && { lastName: lastName?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(timezone !== undefined && { timezone: timezone?.trim() || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        timezone: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/profile/reset-password – placeholder for future OTP/email reset
profileRouter.post('/reset-password', async (_req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    message: 'Password reset will be available when auth is enabled.',
  });
});
