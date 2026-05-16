import { model, Schema } from "mongoose";
import { LEAD_SOURCES, LEAD_STATUSES, LeadSource, LeadStatus } from "../types/lead";

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  owner: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new"
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1, source: 1 });
leadSchema.index({ name: "text", email: "text" });

export const Lead = model<ILead>("Lead", leadSchema);
