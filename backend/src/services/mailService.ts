/**
 * mailService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Gửi email OTP đặt lại mật khẩu.
 *
 * Chế độ hoạt động:
 *  • SMTP MODE   — khi SMTP_HOST + SMTP_USER + SMTP_PASS đủ trong .env
 *  • DEV OTP MODE— khi thiếu bất kỳ trường nào → in OTP ra console, không crash
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { env, logger } from '../config/env.js';

// ────────────────────────────────────────────────────────────────────────────
//  Tạo transporter một lần duy nhất khi module được load
// ────────────────────────────────────────────────────────────────────────────
let transporter: Transporter | null = null;
let smtpReady = false;

if (env.smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure, // true = port 465, false = STARTTLS (587)
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    },
    connectionTimeout: 8_000,   // 8 giây
    socketTimeout: 10_000,      // 10 giây
    greetingTimeout: 5_000
  });
}

// ────────────────────────────────────────────────────────────────────────────
//  Kiểm tra SMTP lúc startup (gọi từ server.ts)
// ────────────────────────────────────────────────────────────────────────────
export const verifyMailTransport = async (): Promise<{ configured: boolean }> => {
  if (!transporter) {
    logger.warn('SMTP chưa được cấu hình đầy đủ (SMTP_HOST / SMTP_USER / SMTP_PASS).');
    logger.warn('⚠  Hệ thống bật DEV OTP MODE — mã OTP sẽ hiển thị trên console.');
    return { configured: false };
  }

  try {
    await transporter.verify();
    smtpReady = true;
    logger.success(`✓ SMTP connected → ${env.smtpHost}:${env.smtpPort}`);
    return { configured: true };
  } catch (error) {
    smtpReady = false;
    logger.warn(`SMTP kết nối thất bại: ${getErrorSummary(error)}`);
    logger.warn('⚠  Hệ thống bật DEV OTP MODE — mã OTP sẽ hiển thị trên console.');
    return { configured: false };
  }
};

// ────────────────────────────────────────────────────────────────────────────
//  Hàm gửi OTP chính — có retry tối đa 2 lần
// ────────────────────────────────────────────────────────────────────────────
export type MailDelivery =
  | { mode: 'smtp' }
  | { mode: 'dev'; debugCode: string };

export const sendResetOtpEmail = async (
  email: string,
  code: string
): Promise<MailDelivery> => {
  // DEV MODE: không có SMTP hoặc SMTP verify đã fail
  if (!transporter || !smtpReady) {
    logger.debug(
      `[DEV OTP MODE]\n  Email: ${email}\n  OTP  : ${code}\n  (Hệ thống chưa cấu hình SMTP — mã chỉ hiển thị ở console)`
    );
    return { mode: 'dev', debugCode: code };
  }

  const mailOptions = {
    from: env.mailFrom,
    to: email,
    subject: 'SpeakAI – Mã xác thực đặt lại mật khẩu',
    html: buildOtpEmailHtml(code)
  };

  // Thử gửi tối đa 2 lần
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      logger.info(`✉  OTP email gửi thành công → ${email} (lần ${attempt})`);
      return { mode: 'smtp' };
    } catch (error) {
      lastError = error;
      const summary = getErrorSummary(error);
      logger.warn(`Gửi email lần ${attempt} thất bại: ${summary}`);

      if (!isRetryableSmtpError(error) || attempt === 2) break;
      // Đợi 1 giây rồi thử lại
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }

  // Sau khi retry vẫn fail → ghi log nội bộ, trả lỗi rõ ràng
  logger.error(`Không thể gửi OTP email đến ${email}: ${getErrorSummary(lastError)}`);

  throw new SmtpSendError(classifySmtpError(lastError));
};

// ────────────────────────────────────────────────────────────────────────────
//  Custom error class để route có thể handle riêng
// ────────────────────────────────────────────────────────────────────────────
export class SmtpSendError extends Error {
  readonly userMessage: string;
  constructor(userMessage: string) {
    super(userMessage);
    this.name = 'SmtpSendError';
    this.userMessage = userMessage;
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  Helpers nội bộ
// ────────────────────────────────────────────────────────────────────────────
const getErrorSummary = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error ?? 'Unknown error');
};

const isRetryableSmtpError = (error: unknown): boolean => {
  const msg = getErrorSummary(error).toLowerCase();
  return (
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('econnrefused') ||
    msg.includes('timeout') ||
    msg.includes('socket hang up')
  );
};

const classifySmtpError = (error: unknown): string => {
  const msg = getErrorSummary(error).toLowerCase();

  if (msg.includes('535') || msg.includes('authentication') || msg.includes('username and password')) {
    return 'Email hoặc mật khẩu ứng dụng (App Password) không đúng. Hãy kiểm tra lại cấu hình SMTP.';
  }
  if (msg.includes('quota') || msg.includes('rate limit') || msg.includes('daily limit')) {
    return 'Dịch vụ email đã đạt giới hạn gửi hàng ngày. Vui lòng thử lại sau.';
  }
  if (msg.includes('invalid') && msg.includes('email')) {
    return 'Địa chỉ email không hợp lệ.';
  }
  if (isRetryableSmtpError(error)) {
    return 'Không thể kết nối đến máy chủ email lúc này. Vui lòng thử lại sau.';
  }
  return 'Không thể gửi email xác thực lúc này. Vui lòng thử lại sau.';
};

const buildOtpEmailHtml = (code: string): string => `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#132238;max-width:640px;margin:0 auto;padding:24px;background:#f8fbff;border-radius:20px;">
  <div style="padding:20px 24px;background:linear-gradient(135deg,#132238 0%,#1cc3d6 100%);border-radius:18px;color:white;">
    <h2 style="margin:0;font-size:28px;">SpeakAI</h2>
    <p style="margin:8px 0 0;opacity:.9;">Xác thực đặt lại mật khẩu</p>
  </div>
  <div style="padding:24px 8px 8px;">
    <p>Xin chào,</p>
    <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản SpeakAI. Mã xác thực của bạn là:</p>
    <p style="font-size:34px;font-weight:700;letter-spacing:10px;color:#0f4c5e;margin:18px 0;text-align:center;">${code}</p>
    <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
    <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
    <p style="margin-top:24px;color:#5b6d7d;">Trân trọng,<br/>Đội ngũ SpeakAI</p>
  </div>
</div>
`;
