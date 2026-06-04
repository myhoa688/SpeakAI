import mongoose from 'mongoose';
import { env } from './src/config/env.js';
import { InterviewSession } from './src/models/InterviewSession.js';

async function run() {
  await mongoose.connect(env.mongoUri);
  const s = await InterviewSession.findById('6a1dcc1fc052eb081567e405');
  console.log(JSON.stringify(s?.answers, null, 2));
  mongoose.disconnect();
}
run().catch(console.error);
