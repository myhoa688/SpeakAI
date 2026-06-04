import { model, Schema, Types } from 'mongoose';

const SessionMemorySchema = new Schema(
  {
    userId:     { type: Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId:  { type: Types.ObjectId, ref: 'Session' },
    personaKey: { type: String, index: true, default: '' },
    date:       { type: Date, default: Date.now },
    mode:       { type: String, default: 'interview' },   // "Phỏng vấn" | "Thuyết trình"
    topic:      { type: String, default: '' },
    scores: {
      troiChay: { type: Number, default: 0 },
      cauTruc:  { type: Number, default: 0 },
      tuTin:    { type: Number, default: 0 },
      noiDung:  { type: Number, default: 0 },
      overall:  { type: Number, default: 0 },
    },
    voiceMetrics: {
      wpm:         { type: Number, default: 0 },
      fillerWords: { type: Number, default: 0 },
      longPauses:  { type: Number, default: 0 },
    },
    strengths:       { type: [String], default: [] },
    improvements:    { type: [String], default: [] },
    promisedNextTime:{ type: [String], default: [] },  // việc AI dặn buổi trước
    completedPromises: { type: [Number], default: [] }, // index các việc đã check
    summary:         { type: String, default: '' },
  },
  { timestamps: true }
);

export const SessionMemory = model('SessionMemory', SessionMemorySchema);
