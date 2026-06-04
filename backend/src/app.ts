import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import adminRoutes from './routes/adminRoutes.js';
// import adminCourseRoutes from './routes/adminCourseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import authRoutes from './routes/authRoutes.js';
// import courseRoutes from './routes/courseRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import interviewSetRoutes from './routes/interviewSetRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
export const app = express();

const privateNetworkHostPattern =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;

const renderHostPattern = /\.onrender\.com$/i;

const configuredOrigins = [env.appUrl].map((item) => item.trim()).filter(Boolean);

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsed = new URL(origin);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    return privateNetworkHostPattern.test(parsed.hostname) || renderHostPattern.test(parsed.hostname);
  } catch {
    return false;
  }
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(currentDir, '..', '..', 'frontend', 'dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin ?? undefined)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by SpeakAI CORS.'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadsPath = path.resolve(currentDir, '..', '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SpeakAI API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sessions', sessionRoutes);
// app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/interview-sets', interviewSetRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/ratings', ratingRoutes);
if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(frontendIndexPath);
  });
}

import { logger } from './config/env.js';

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Log nội bộ với đầy đủ chi tiết
  logger.error(`Unhandled error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);

  // Không expose stack trace ra ngoài
  const isDev = process.env.NODE_ENV !== 'production';
  const message = error instanceof Error
    ? (isDev ? error.message : 'Đã xảy ra lỗi trên server.')
    : 'Đã xảy ra lỗi trên server.';

  res.status(500).json({ message });
});

