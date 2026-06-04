/**
 * authRoutes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Đăng ký / Đăng nhập / Forgot-password với:
 *  • Rate-limit chống spam OTP (5 req / 15 phút)
 *  • OTP được hash trước khi lưu DB
 *  • Invalidate OTP ngay sau khi dùng
 *  • Error message thân thiện, không lộ stack trace
 */

import { Router } from 'express';
import crypto from 'crypto';

import { logger } from '../config/env.js';
import { authRequired } from '../middleware/auth.js';
import { ResetOtp } from '../models/ResetOtp.js';
import { User } from '../models/User.js';
import { sendResetOtpEmail, SmtpSendError, type MailDelivery } from '../services/mailService.js';
import { comparePassword, generateOtp, hashPassword, serializeUser, signToken } from '../utils/auth.js';
import { applyLoginProgression } from '../utils/progression.js';

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
//  Rate-limit đơn giản cho OTP — in-memory (đủ dùng cho 1 instance)
//  Giới hạn: 5 lần / 15 phút / email
// ────────────────────────────────────────────────────────────────────────────
const OTP_WINDOW_MS = 15 * 60 * 1000; // 15 phút
const OTP_MAX_REQUESTS = 5;

const otpRateMap = new Map<string, { count: number; resetAt: number }>();

const checkOtpRateLimit = (email: string): boolean => {
  const now = Date.now();
  const entry = otpRateMap.get(email);

  if (!entry || now > entry.resetAt) {
    otpRateMap.set(email, { count: 1, resetAt: now + OTP_WINDOW_MS });
    return true; // OK
  }

  if (entry.count >= OTP_MAX_REQUESTS) {
    return false; // Bị chặn
  }

  entry.count += 1;
  return true;
};

// Dọn dẹp rate map định kỳ để tránh memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of otpRateMap.entries()) {
    if (now > val.resetAt) otpRateMap.delete(key);
  }
}, 5 * 60 * 1000);

// ────────────────────────────────────────────────────────────────────────────
//  Hash OTP để lưu DB (SHA-256, không cần bcrypt vì OTP ngắn hạn)
// ────────────────────────────────────────────────────────────────────────────
const hashOtp = (code: string): string =>
  crypto.createHash('sha256').update(code).digest('hex');

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/register
// ────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu cần có ít nhất 6 ký tự.' });
    }

    // Validate email format cơ bản
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Địa chỉ email không hợp lệ.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email đã được sử dụng.' });
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role: 'user'
    });

    applyLoginProgression(user);
    await user.save();

    logger.info(`Người dùng mới đăng ký: ${normalizedEmail}`);

    return res.status(201).json({
      message: 'Đăng ký thành công.',
      token: signToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    logger.error(`[register] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        message: user.disabledReason
          ? `Tài khoản của bạn đang bị vô hiệu hóa. Lý do: ${user.disabledReason}`
          : 'Tài khoản của bạn đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    applyLoginProgression(user);
    await user.save();

    return res.json({
      message: 'Đăng nhập thành công.',
      token: signToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    logger.error(`[login] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me
// ────────────────────────────────────────────────────────────────────────────
router.get('/me', authRequired, async (req, res) => {
  return res.json({ user: serializeUser(req.user!) });
});

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password/request
//  Tạo OTP, lưu hash vào DB, gửi email (hoặc in console ở DEV MODE)
// ────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Địa chỉ email không hợp lệ.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Bảo vệ bằng rate-limit
    if (!checkOtpRateLimit(normalizedEmail)) {
      return res.status(429).json({
        message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 15 phút rồi thử lại.'
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Không tiết lộ email có tồn tại không với user chưa tìm thấy / disabled
    if (!user || user.isDisabled) {
      return res.json({ message: 'Nếu email tồn tại, mã xác thực đã được gửi.' });
    }

    // Tạo OTP, hash trước khi lưu
    const code = generateOtp();
    const hashedCode = hashOtp(code);

    await ResetOtp.deleteMany({ email: normalizedEmail });
    await ResetOtp.create({
      email: normalizedEmail,
      code: hashedCode,               // ← lưu hash
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    let delivery: MailDelivery;
    try {
      delivery = await sendResetOtpEmail(normalizedEmail, code); // gửi OTP gốc (chưa hash)
    } catch (mailError) {
      if (mailError instanceof SmtpSendError) {
        return res.status(503).json({ message: mailError.userMessage });
      }
      throw mailError;
    }

    const isDev = delivery.mode === 'dev';

    logger.info(`OTP ${isDev ? '(DEV)' : '(SMTP)'} đã tạo cho ${normalizedEmail}`);

    return res.json({
      message: isDev
        ? 'Mã xác thực đã được tạo (chế độ DEV – xem console hoặc trường debugCode).'
        : 'Mã xác thực đã được gửi qua email. Vui lòng kiểm tra hộp thư.',
      deliveryMode: delivery.mode,
      // Chỉ trả debugCode khi ở DEV mode
      debugCode: delivery.mode === 'dev' ? delivery.debugCode : undefined
    });
  } catch (error) {
    logger.error(`[forgot-password/request] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password/verify
//  Xác thực OTP (chống brute-force bằng attempts limit)
// ────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/verify', async (req, res) => {
  try {
    const { email, code } = req.body as { email?: string; code?: string };

    if (!email || !code) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mã OTP.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await ResetOtp.findOne({
      email: normalizedEmail,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ message: 'Mã OTP đã hết hạn hoặc chưa được tạo. Vui lòng gửi lại.' });
    }

    // Chống brute-force: tối đa 5 lần thử
    if (record.attempts >= 5) {
      await ResetOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'Mã OTP đã bị khóa do nhập sai quá nhiều lần. Vui lòng gửi lại.' });
    }

    const hashedInput = hashOtp(code.trim());
    if (record.code !== hashedInput) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        message: `Mã OTP không chính xác. Còn ${remaining} lần thử.`
      });
    }

    return res.json({ message: 'OTP hợp lệ. Hãy đặt mật khẩu mới.' });
  } catch (error) {
    logger.error(`[forgot-password/verify] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password/reset
//  Đổi mật khẩu + xóa OTP ngay sau khi dùng
// ────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body as {
      email?: string;
      code?: string;
      newPassword?: string;
    };

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới cần ít nhất 6 ký tự.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedInput = hashOtp(code.trim());

    const record = await ResetOtp.findOne({
      email: normalizedEmail,
      code: hashedInput,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại.' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: 'Tài khoản này đang bị vô hiệu hóa, không thể đặt lại mật khẩu.' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Invalidate OTP ngay sau khi dùng
    await ResetOtp.deleteMany({ email: normalizedEmail });

    logger.info(`Mật khẩu đã được đặt lại cho ${normalizedEmail}`);

    return res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (error) {
    logger.error(`[forgot-password/reset] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});
// ────────────────────────────────────────────────────────────────────────────
// Đổi mật khẩu
// ────────────────────────────────────────────────────────────────────────────
router.patch('/change-password', authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.' });
    }

    const user = req.user!;
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return res.json({ message: 'Cập nhật mật khẩu thành công.' });
  } catch (error) {
    logger.error(`[auth/change-password] ${error instanceof Error ? error.message : String(error)}`);
    return res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

export default router;
