import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { SOSAlert } from '../models/SOSAlert';
import { createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

const router = Router();

router.use(authenticate);

// ─── POST /api/sos ──────────────────────────────────────────────────────────
// Trigger a new SOS alert
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, message } = req.body;

    if (!lat || !lng) throw createError('Location (lat, lng) is required for SOS', 400);

    const userId = new mongoose.Types.ObjectId(req.user!.userId);

    // Resolve any existing active SOS for this user first
    await SOSAlert.updateMany(
      { userId, status: 'active' },
      { status: 'resolved', resolvedAt: new Date() }
    );

    const sos = await SOSAlert.create({
      userId,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      message: message ? message.trim() : undefined,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'SOS alert sent! Emergency services have been notified.',
      sos,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/sos/active ────────────────────────────────────────────────────
// Get current active SOS for logged-in user
router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const sos = await SOSAlert.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

    res.json({ success: true, sos: sos || null });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/sos ───────────────────────────────────────────────────────────
// Get all SOS history for the user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const alerts = await SOSAlert.find({ userId }).sort({ createdAt: -1 }).limit(20);

    res.json({ success: true, alerts });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/sos/:id/resolve ─────────────────────────────────────────────
// Mark a specific SOS as resolved
router.patch('/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const sos = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, userId, status: 'active' },
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );

    if (!sos) throw createError('Active SOS not found', 404);

    res.json({ success: true, message: 'SOS resolved', sos });
  } catch (err) {
    next(err);
  }
});

export default router;
