import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { createAndStoreOtp, verifyOtp } from '../services/otpService';
import { sendOtpEmail } from '../services/emailService';
import { generateToken, authenticate } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { config } from '../config/config';

const router = Router();

/** Rate limit: 5 OTP requests per 15 minutes per IP */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── POST /api/auth/send-otp ────────────────────────────────────────────────
// Generate & email OTP for login (user must already exist)
router.post('/send-otp', otpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw createError('Email is required', 400);

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });
    if (!user) throw createError('No account found with this email. Please sign up first.', 404);

    const otp = await createAndStoreOtp(emailLower, 'login');
    await sendOtpEmail(emailLower, otp);

    // In dev mode, also log OTP to console
    if (config.nodeEnv === 'development') {
      console.log(`\n📧 OTP for ${emailLower}: ${otp}\n`);
    }

    res.json({ success: true, message: `OTP sent to ${emailLower}` });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/signup ──────────────────────────────────────────────────
// Register a new user with name + email + password, then send OTP to verify email
router.post('/signup', otpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      throw createError('Name, email and password are required', 400);
    if (password.length < 6)
      throw createError('Password must be at least 6 characters', 400);

    const emailLower = email.toLowerCase().trim();

    const existing = await User.findOne({ email: emailLower });
    if (existing && existing.isVerified)
      throw createError('An account with this email already exists. Please login.', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    // Upsert: if user exists but unverified (maybe re-registering), update them
    const user = await User.findOneAndUpdate(
      { email: emailLower },
      { name: name.trim(), passwordHash, isVerified: false },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send verification OTP
    const otp = await createAndStoreOtp(emailLower, 'signup');
    await sendOtpEmail(emailLower, otp);

    if (config.nodeEnv === 'development') {
      console.log(`\n📧 Signup OTP for ${emailLower}: ${otp}\n`);
    }

    res.status(201).json({
      success: true,
      message: `OTP sent to ${emailLower}. Please verify your email to complete signup.`,
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/verify-otp ─────────────────────────────────────────────
// Verify OTP → mark user verified → return JWT
router.post('/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, purpose = 'login' } = req.body;
    if (!email || !otp) throw createError('Email and OTP are required', 400);
    if (!['login', 'signup'].includes(purpose))
      throw createError('Invalid purpose', 400);

    const emailLower = email.toLowerCase().trim();

    await verifyOtp(emailLower, otp, purpose);

    const user = await User.findOneAndUpdate(
      { email: emailLower },
      { isVerified: true, lastLoginAt: new Date() },
      { new: true }
    );

    if (!user) throw createError('User not found', 404);

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      success: true,
      message: purpose === 'signup' ? 'Email verified! Welcome 🎉' : 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
// Login with email + password (no OTP required)
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw createError('Email and password are required', 400);

    const emailLower = email.toLowerCase().trim();

    // Explicitly select passwordHash (it is hidden by default)
    const user = await User.findOne({ email: emailLower }).select('+passwordHash');
    if (!user) throw createError('Invalid email or password', 401);
    if (!user.passwordHash) throw createError('This account uses OTP login. Please use OTP.', 400);
    if (!user.isVerified)
      throw createError('Email not verified. Please complete OTP verification.', 403);

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) throw createError('Invalid email or password', 401);

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
// Return current user profile (protected)
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw createError('User not found', 404);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
// Client should discard the JWT. Stateless logout.
router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
