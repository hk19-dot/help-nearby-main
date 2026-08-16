import mongoose, { Document, Schema } from 'mongoose';

export type IncidentType = 'medical' | 'fire' | 'crime' | 'accident' | 'disaster';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'acknowledged' | 'resolved';

export interface ILocation {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface IIncidentReport extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;    // optional: anonymous reports allowed
  type: IncidentType;
  description: string;
  urgencyLevel: UrgencyLevel;
  urgencyKeywords: string[];
  imageUrl?: string;
  location: ILocation;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentReportSchema = new Schema<IIncidentReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: ['medical', 'fire', 'crime', 'accident', 'disaster'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    urgencyKeywords: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

IncidentReportSchema.index({ status: 1, createdAt: -1 });

export const IncidentReport = mongoose.model<IIncidentReport>(
  'IncidentReport',
  IncidentReportSchema
);
