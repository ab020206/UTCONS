import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    enum: ["student", "parent", "teacher", "organisation"],
    default: "student",
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstTimeLogin: { type: Boolean, default: true },
  fullName: { type: String, default: "" },
  preferences:{
    interests: [String],
    style: String,
  }
});

// Correct model export pattern:
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
