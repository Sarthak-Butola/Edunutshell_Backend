import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, // single user
  team: { type: String }, // optional team assignment
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  type: { type: String, enum: ["daily", "form", "document"], default: "daily" },
  picture: { type: String }, // optional, URL/path
  // workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow" }, // optional link to workflow
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;
