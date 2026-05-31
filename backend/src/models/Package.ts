import { model, Schema, type InferSchemaType, type Types } from 'mongoose';

const packageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true }, // VND
    originalPrice: { type: Number, default: 0 }, // Giá gốc để hiển thị % giảm giá
    period: { type: String, default: '1 lần' }, // "3 ngày", "14 ngày", "90 ngày"
    desc: { type: String, default: '' },
    features: { type: [String], default: [] },
    isPopular: { type: Boolean, default: false },
    color: { type: String, default: '#6c63ff' },
    interviewAttempts: { type: Number, required: true }, // Số lượt phỏng vấn được cộng thêm
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export type PackageShape = InferSchemaType<typeof packageSchema> & { _id: Types.ObjectId };
export const Package = model('Package', packageSchema);
