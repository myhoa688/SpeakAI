import dotenv from 'dotenv';

dotenv.config();

// ────────────────────────────────────────────────────────────
//  Logger nhỏ gọn, màu sắc cho startup (không dùng thư viện ngoài)
// ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

export const logger = {
  info: (msg: string) => console.log(`${c.cyan}[INFO]${c.reset} ${msg}`),
  warn: (msg: string) => console.warn(`${c.yellow}[WARN]${c.reset} ${msg}`),
  error: (msg: string) => console.error(`${c.red}[ERROR]${c.reset} ${msg}`),
  success: (msg: string) => console.log(`${c.green}[OK]${c.reset} ${msg}`),
  debug: (msg: string) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${c.bold}[DEBUG]${c.reset} ${msg}`);
    }
  }
};

// ────────────────────────────────────────────────────────────
//  Helper validate bắt buộc
// ────────────────────────────────────────────────────────────
const requireValue = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`${key} là bắt buộc trong biến môi trường backend.`);
  }
  return value;
};

const warnIfMissing = (value: string | undefined, key: string): string => {
  if (!value) {
    logger.warn(`${key} chưa được cấu hình — một số tính năng sẽ bị giới hạn.`);
  }
  return value ?? '';
};

// ────────────────────────────────────────────────────────────
//  Env object
// ────────────────────────────────────────────────────────────
export const env = {
  nodeEnv: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 5000),

  // Database
  mongoUri: requireValue(process.env.MONGO_URI, 'MONGO_URI'),
  mongoUriFallback: process.env.MONGO_URI_FALLBACK ?? 'mongodb://127.0.0.1:27017/speakai',

  // JWT
  jwtSecret: requireValue(process.env.JWT_SECRET, 'JWT_SECRET'),

  // ── OPENAI (API chính cho AI) ────────────────────────────────
  openaiApiKey: warnIfMissing(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY'),
  openaiTextModel: process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o-mini',
  openaiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? 'gpt-4o-mini-transcribe',
  openaiRealtimeModel: process.env.OPENAI_REALTIME_MODEL ?? 'gpt-realtime',
  openaiRealtimeVoice: process.env.OPENAI_REALTIME_VOICE ?? 'marin',

  // ── GROQ compat (giữ alias cũ để không vỡ code legacy) ──
  groqApiKey: process.env.OPENAI_API_KEY ?? process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.OPENAI_TEXT_MODEL ?? process.env.GROQ_MODEL ?? 'gpt-4o-mini',
  groqTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? process.env.GROQ_TRANSCRIBE_MODEL ?? 'gpt-4o-mini-transcribe',

  // ── SMTP / Email ───────────────────────────────────────────
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: (process.env.SMTP_PASS ?? '').replace(/\s+/g, ''),

  // Cho phép gửi mail thật chỉ khi có đủ host + user + pass
  get smtpConfigured(): boolean {
    return Boolean(this.smtpHost && this.smtpUser && this.smtpPass);
  },

  mailFrom: process.env.MAIL_FROM ?? 'SpeakAI <no-reply@speakai.local>',
  appUrl: process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@speakai.local',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin@123'
};
