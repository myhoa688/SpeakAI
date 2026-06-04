import { model, Schema, Types } from 'mongoose';

/**
 * Phiên hội thoại live — theo dõi trạng thái trong suốt buổi.
 * Transcript được append realtime; sau khi end → tạo SessionMemory.
 */
const SessionSchema = new Schema(
  {
    userId:     { type: Types.ObjectId, ref: 'User', required: true, index: true },
    personaKey: { type: String, default: 'hr_linh' },
    mode:       { type: String, default: 'interview' },      // "interview" | "presentation"
    difficulty: { type: String, default: 'medium' },         // "easy" | "medium" | "hard"
    topic:      { type: String, default: '' },
    status:     { type: String, enum: ['active', 'ended', 'aborted'], default: 'active' },
    startedAt:  { type: Date, default: Date.now },
    endedAt:    { type: Date },
    durationSec:{ type: Number },
    transcript: [
      {
        who:  { type: String },    // "user" | "ai"
        text: { type: String },
        at:   { type: Date, default: Date.now },
        _id:  false,
      },
    ],
  },
  { timestamps: true }
);

export const Session = model('Session', SessionSchema);
