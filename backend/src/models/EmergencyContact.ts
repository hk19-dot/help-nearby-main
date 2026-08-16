import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'Invalid phone number format'],
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate phone for same user
EmergencyContactSchema.index({ userId: 1, phone: 1 }, { unique: true });

export const EmergencyContact = mongoose.model<IEmergencyContact>(
  'EmergencyContact',
  EmergencyContactSchema
);
