import { model, Schema, Types } from 'mongoose';

/**
 * Hồ sơ người học — trích từ CV, cập nhật dần.
 * Gần như tĩnh; không thay đổi theo từng buổi.
 */
const LearnerProfileSchema = new Schema(
  {
    userId:     { type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    targetRole: { type: String, default: '' },
    skills:     { type: [String], default: [] },
    experience: [{ title: String, org: String, years: Number }],
    strengths:  { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    goals:      { type: [String], default: [] },
    cvRaw:      { type: String, select: false },   // text CV gốc (ẩn mặc định, PII)
  },
  { timestamps: true }
);

export const LearnerProfile = model('LearnerProfile', LearnerProfileSchema);
