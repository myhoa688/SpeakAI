import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const questionSchema = new Schema(
  {
    industryGroup: { type: String, required: true, trim: true, index: true },
    industry: { type: String, required: true, trim: true, index: true },
    specialization: { type: String, default: '', trim: true, index: true },
    question: { type: String, required: true, trim: true },
    guidance: { type: String, default: '' },
    sampleAnswer: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
    analysis: {
      interviewerEvaluation: { type: [String], default: [] },
      answerStructure: {
        open: { type: String, default: '' },
        points: { type: [String], default: [] },
        close: { type: String, default: '' }
      },
      importantTips: [
        {
          priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
          content: { type: String }
        }
      ],
      followUpQuestions: { type: [String], default: [] },
      commonMistakes: { type: [String], default: [] }
    }
  },
  {
    timestamps: true
  }
);

export type QuestionShape = InferSchemaType<typeof questionSchema> & { _id: Types.ObjectId };
export const Question = model('Question', questionSchema);
