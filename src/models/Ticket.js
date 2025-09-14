import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  by: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "admin"], required: true }
    // name: { type: String, required: true } // store name at time of response
  },
  message: { type: String, required: true },
  at: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ["open", "in-progress", "closed"], default: "open" },
  responses: [responseSchema],
  createdAt: { type: Date, default: Date.now }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
