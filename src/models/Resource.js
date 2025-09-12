import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    fileUrl: { type: String, required: true }, // link to file (S3, local, etc.)

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // admin/user who uploaded

    visibleTo: {
      type: [String],
      enum: ["admin", "user"],
      default: ["admin", "user"], // visible to both by default
    },

    language: { 
      type: String, 
      default: "en" 
    }
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;
