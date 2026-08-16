import mongoose, { Document, Schema } from 'mongoose';

export type OtpPurpose = 'signup' | 'login' | 'reset';

export interface IOtpToken extends Document {
  email: string;
  otpHash: string;                // bcrypt hash of OTP — never stored plain
  purpose: OtpPurpose;
  attempts: number;               // track wrong attempts
  expiresAt: Date;
  createdAt: Date;
}

const OtpTokenSchema = new Schema<IOtpToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: document auto-deleted after expiry
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Compound index so we can quickly find by email+purpose
OtpTokenSchema.index({ email: 1, purpose: 1 });

export const OtpToken = mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);
