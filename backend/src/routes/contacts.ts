import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { EmergencyContact } from '../models/EmergencyContact';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

const router = Router();

// All contact routes require authentication
router.use(authenticate);

// ─── GET /api/contacts ──────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contacts = await EmergencyContact.find({
      userId: new mongoose.Types.ObjectId(req.user!.userId),
    }).sort({ createdAt: -1 });

    res.json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/contacts ─────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone) throw createError('Name and phone are required', 400);

    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    // Check < 10 contacts per user
    const count = await EmergencyContact.countDocuments({ userId });
    if (count >= 10) throw createError('Maximum 10 emergency contacts allowed', 400);

    const contact = await EmergencyContact.create({
      userId,
      name: name.trim(),
      phone: phone.trim(),
      relationship: (relationship || '').trim(),
    });

    res.status(201).json({ success: true, contact });
  } catch (err: unknown) {
    // Duplicate phone for same user
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      next(createError('This phone number already exists in your contacts', 409));
    } else {
      next(err);
    }
  }
});

// ─── PUT /api/contacts/:id ──────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, relationship } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: req.params.id, userId },
      {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(relationship !== undefined && { relationship: relationship.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!contact) throw createError('Contact not found', 404);

    res.json({ success: true, contact });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      next(createError('This phone number already exists in your contacts', 409));
    } else {
      next(err);
    }
  }
});

// ─── DELETE /api/contacts/:id ───────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const contact = await EmergencyContact.findOneAndDelete({ _id: req.params.id, userId });
    if (!contact) throw createError('Contact not found', 404);

    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
