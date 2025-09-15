import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Links answer to specific question
  value: mongoose.Schema.Types.Mixed                                // Can be text, number, option, etc.
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now }
});

const Response = mongoose.model("Response", responseSchema);
export default Response;
