import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },             // Question text
  type: { type: String, required: true },              // "text", "radio", "checkbox", "number", etc.
  options: [String]                                    // Only for radio/checkbox
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },             // Form name/title
  description: { type: String },                       // Optional description
  fields: [fieldSchema],                               // Dynamic set of questions
  assignedTo: { type: String, enum: ["user", "admin","both"], default: "user" }, // role-based assignment
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

const Form = mongoose.model("Form", formSchema);
export default Form;
