import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lastSummary: { type: String, default: '' },
    actionItems: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const ConversationMemory = mongoose.model('ConversationMemory', schema);
