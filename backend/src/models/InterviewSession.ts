import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const interviewAnswerSchema = new Schema(
  {
    questionId: { type: String, default: '' },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    score: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] }
  },
  { _id: false }
);

const interviewSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    industryGroup: { type: String, default: '' },
    industry: { type: String, default: '' },
    specialization: { type: String, default: '' },
    experienceLevel: { type: String, default: 'junior' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    topic: { type: String, default: '' },
    jobDescriptionText: { type: String, default: '' },
    company: { type: String, default: '' },
    cvText: { type: String, default: '' },
    totalQuestions: { type: Number, default: 5 },
    currentQuestionIndex: { type: Number, default: 0 },
    answers: { type: [interviewAnswerSchema], default: [] },
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    skillRadar: { 
      type: Object, 
      default: { contentQuality: 0, clarity: 0, expertise: 0, confidence: 0 } 
    },
    overallStrengths: { type: [String], default: [] },
    overallImprovements: { type: [String], default: [] },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress', index: true },
    language: { type: String, default: 'vi' },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

export type InterviewAnswer = InferSchemaType<typeof interviewAnswerSchema>;
export type InterviewSessionShape = InferSchemaType<typeof interviewSessionSchema> & { _id: Types.ObjectId };

export const InterviewSession = model('InterviewSession', interviewSessionSchema);
