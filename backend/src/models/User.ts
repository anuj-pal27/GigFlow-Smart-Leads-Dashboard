import { model, Schema } from "mongoose";
import { USER_ROLES, UserRole } from "../types/roles";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "sales"
    }
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>("User", userSchema);
