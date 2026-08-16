import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import { IncidentReport } from '../models/IncidentReport';
import { createError } from '../middleware/errorHandler';
import { config } from '../config/config';
import mongoose from 'mongoose';

const router = Router();

// ─── Multer setup for image uploads ─────────────────────────────────────────
const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `report_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ─── Urgency analysis (server-side) ─────────────────────────────────────────
const analyzeUrgency = (
  text: string
): { level: 'low' | 'medium' | 'high' | 'critical'; keywords: string[] } => {
  const lower = text.toLowerCase();
  const criticalWords = ['dying', 'death', 'kill', 'weapon', 'gun', 'stabbed', 'bleeding heavily', 'unconscious', 'not breathing'];
  const highWords = ['help', 'danger', 'attack', 'fire', 'trapped', 'injured', 'bleeding', 'collapse', 'explosion'];
  const mediumWords = ['accident', 'broken', 'pain', 'smoke', 'flood', 'stuck', 'emergency'];

  const found: string[] = [];
  for (const w of criticalWords) if (lower.includes(w)) found.push(w);
  if (found.length > 0) return { level: 'critical', keywords: found };

  for (const w of highWords) if (lower.includes(w)) found.push(w);
  if (found.length > 0) return { level: 'high', keywords: found };

  for (const w of mediumWords) if (lower.includes(w)) found.push(w);
  if (found.length > 0) return { level: 'medium', keywords: found };

  return { level: 'low', keywords: [] };
};

// ─── POST /api/reports ───────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, description, lat, lng, address } = req.body;

      if (!type || !description)
        throw createError('Incident type and description are required', 400);
      if (description.length < 10)
        throw createError('Description must be at least 10 characters', 400);

      const validTypes = ['medical', 'fire', 'crime', 'accident', 'disaster'];
      if (!validTypes.includes(type)) throw createError('Invalid incident type', 400);

      const { level, keywords } = analyzeUrgency(description);

      const imageUrl = req.file
        ? `/uploads/${req.file.filename}`
        : undefined;

      const report = await IncidentReport.create({
        userId: new mongoose.Types.ObjectId(req.user!.userId),
        type,
        description: description.trim(),
        urgencyLevel: level,
        urgencyKeywords: keywords,
        imageUrl,
        location: {
          lat: lat ? parseFloat(lat) : undefined,
          lng: lng ? parseFloat(lng) : undefined,
          address: address || undefined,
        },
        status: 'pending',
      });

      res.status(201).json({ success: true, report });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/reports ────────────────────────────────────────────────────────
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const filter: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(req.user!.userId),
    };
    if (status) filter.status = status;

    const [reports, total] = await Promise.all([
      IncidentReport.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string)),
      IncidentReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/reports/:id ────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await IncidentReport.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user!.userId),
    });
    if (!report) throw createError('Report not found', 404);
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
});

export default router;
