import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/config';
import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { verifyEmailConnection } from './services/emailService';

// Routes
import authRoutes from './routes/auth';
import contactRoutes from './routes/contacts';
import reportRoutes from './routes/reports';
import sosRoutes from './routes/sos';

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === config.frontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🚨 Help Nearby API is running',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/sos', sosRoutes);

// ─── 404 + Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  await verifyEmailConnection();

  app.listen(config.port, () => {
    console.log(`\n🚨 Help Nearby Backend`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🟢 Server:   http://localhost:${config.port}`);
    console.log(`🔗 API:      http://localhost:${config.port}/api`);
    console.log(`📊 Health:   http://localhost:${config.port}/api/health`);
    console.log(`🌐 Frontend: ${config.frontendUrl}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
