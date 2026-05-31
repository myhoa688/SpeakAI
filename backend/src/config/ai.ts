import OpenAI from 'openai';
import { env, logger } from './env.js';

export const aiClient = env.openaiApiKey
  ? new OpenAI({
      apiKey: env.openaiApiKey
    })
  : null;

if (!aiClient) {
  logger.warn('OPENAI_API_KEY chưa được cấu hình — Tính năng AI sẽ dùng dữ liệu dự phòng.');
}
