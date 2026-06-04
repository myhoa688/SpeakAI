import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { InterviewSession } from './src/models/InterviewSession.js';
import { InterviewSet } from './src/models/InterviewSet.js';

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log('Connected to MongoDB');

  const sets = await InterviewSet.find().sort({ createdAt: -1 }).limit(5);
  for (const set of sets) {
    console.log('Set:', set.title, 'questionIds:', set.questionIds?.length);
  }

  mongoose.disconnect();
}

run().catch(console.error);
