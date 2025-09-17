import mongoose from "mongoose";

const templateTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ["daily", "form", "document"], default: "daily" },
  picture: { type: String }, // optional, URL/path
  dueAfterDays: { type: Number, default: 0 }, // offset from startDate or assignment
});

const taskTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "HR Onboarding"
    category: { type: String }, // e.g. HR, Dev, etc.
    tasks: [templateTaskSchema], // blueprint tasks
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who made it
  },
  { timestamps: true }
);

const TaskTemplate = mongoose.model("TaskTemplate", taskTemplateSchema);
export default TaskTemplate;
