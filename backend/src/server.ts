import http from 'http';
import os from 'os';

import { app } from './app.js';
import { connectDatabase } from './config/db.js';
import { env, logger } from './config/env.js';
import { setupSocket } from './config/socket.js';
import { ensureDefaultAdmin } from './services/bootstrapService.js';
import { verifyMailTransport } from './services/mailService.js';

const getLanUrls = (port: number) =>
  Object.values(os.networkInterfaces())
    .flat()
    .filter((item): item is os.NetworkInterfaceInfo => item !== undefined)
    .filter((item) => item.family === 'IPv4' && !item.internal)
    .map((item) => `http://${item.address}:${port}`);

const start = async () => {
  // ── Kiểm tra biến môi trường bắt buộc ──────────────────────────────────
  if (!env.openaiApiKey) {
    logger.warn('Chạy ở chế độ MOCK AI vì thiếu OPENAI_API_KEY. Một số tính năng sẽ trả về dữ liệu mẫu.');
  }

  // ── Kết nối Database ─────────────────────────────────────────────────────
  await connectDatabase();
  await ensureDefaultAdmin();

  // ── Kiểm tra SMTP ────────────────────────────────────────────────────────
  await verifyMailTransport();

  // ── Khởi động HTTP server + Socket.IO ──────────────────────────────────
  const server = http.createServer(app);
  setupSocket(server);

  server.listen(env.port, env.host, () => {
    const lanUrls = getLanUrls(env.port);

    logger.success('SpeakAI backend đã sẵn sàng.');
    logger.info(`Local:   http://localhost:${env.port}`);

    if (lanUrls.length) {
      lanUrls.forEach((url) => logger.info(`Network: ${url}`));
    }

    logger.info(`Môi trường: ${env.nodeEnv}`);
    logger.info(`AI Model: ${env.openaiTextModel} (via OpenAI)`);
    logger.info('Socket.IO đã sẵn sàng.');
  });
};

start().catch((error) => {
  logger.error(`Không thể khởi động backend: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
