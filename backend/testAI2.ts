import { generateInterviewQuestion } from './src/services/aiService.js';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';

async function run() {
  await mongoose.connect(env.mongoUri);
  try {
    const q = await generateInterviewQuestion({
      difficulty: 'medium',
      targetRole: 'Technical Trainee',
      history: [{
        question: 'Chào Ân, mình là Alex, Senior Technical Interviewer tại X Interview. Rất vui được gặp bạn hôm nay! Bạn có thể giới thiệu một chút về bản thân và những gì bạn đã làm trong công việc trước đây không?',
        answer: 'tôi'
      }],
      topic: 'Technical Trainee',
      language: 'vi',
      lastAnswerScore: 15
    });
    console.log('Question 2:', q);
  } catch (e) {
    console.error(e);
  }
  mongoose.disconnect();
}
run().catch(console.error);
