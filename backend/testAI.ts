import { generateInterviewQuestion } from './src/services/aiService.js';
import mongoose from 'mongoose';
import { env } from './src/config/env.js';

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('Testing AI connection...');
  try {
    const q = await generateInterviewQuestion({
      difficulty: 'medium',
      targetRole: 'Software Engineer',
      history: [],
      topic: 'React',
      language: 'vi'
    });
    console.log('Question:', q);
  } catch (e) {
    console.error('Error:', e);
  }
  mongoose.disconnect();
}
run().catch(console.error);
