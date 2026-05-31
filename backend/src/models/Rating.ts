import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sessionType: { type: String, enum: ['practice', 'interview'], required: true },
    sessionId: { type: Schema.Types.ObjectId, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export type RatingShape = InferSchemaType<typeof ratingSchema> & { _id: Types.ObjectId };
export const Rating = model('Rating', ratingSchema);
