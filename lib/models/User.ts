import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  studentId?: mongoose.Schema.Types.ObjectId;
  firstTimeLogin?: boolean;
  fullName?: string;
  preferences?: {
    interests: string[];
    style: string;
  };
  aspiration?: string;
  xp?: number;
  streak?: number;
  completedModules?: string[];
  lastLogin?: Date;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "parent", "teacher", "admin"],
    default: "student",
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstTimeLogin: { type: Boolean, default: true },
  fullName: { type: String, default: "" },
  preferences:{
    interests: [String],
    style: String,
  },
  aspiration: { type: String, default: "" },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  completedModules: { type: [String], default: [] },
  lastLogin: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
