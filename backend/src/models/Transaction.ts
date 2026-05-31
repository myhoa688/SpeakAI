import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  amount: number;
  transactionCode: string;
  orderCode: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  amount: { type: Number, required: true },
  transactionCode: { type: String, required: true, unique: true },
  orderCode: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
