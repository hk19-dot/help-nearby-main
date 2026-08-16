import mongoose, { Document, Schema } from 'mongoose';

export type SOSStatus = 'active' | 'resolved';

export interface ISOSAlert extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  location: {
    lat: number;
    lng: number;
  };
  message?: string;
  status: SOSStatus;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SOSAlertSchema = new Schema<ISOSAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

SOSAlertSchema.index({ userId: 1, status: 1 });

export const SOSAlert = mongoose.model<ISOSAlert>('SOSAlert', SOSAlertSchema);
