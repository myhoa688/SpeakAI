import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewSet extends Document {
  title: string;
  company: string;
  industry: string;
  category: 'technical' | 'behavioral' | 'management' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  durationMinutes: number;
  experienceLevel: string;
  jobDescription: string;
  tags: string[];
  isPublished: boolean;
  attemptCount: number;
  averageScore: number;
  createdAt: Date;
}

const InterviewSetSchema = new Schema<IInterviewSet>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'management', 'general'],
      default: 'general'
    },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questionCount: { type: Number, default: 5 },
    durationMinutes: { type: Number, default: 15 },
    experienceLevel: { type: String, default: 'junior' },
    jobDescription: { type: String, required: true },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    attemptCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const InterviewSet = mongoose.model<IInterviewSet>('InterviewSet', InterviewSetSchema);
