import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  team: { type: String },
  phone: { type: String },
  startDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "inactive", "pending"], default: "pending" },
  preferredLanguage: { type: String, default: "en" }
});

const User = mongoose.model("User", userSchema);
export default User;
