import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const cvSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export type CVShape = InferSchemaType<typeof cvSchema> & { _id: Types.ObjectId };

export const CV = model('CV', cvSchema);
