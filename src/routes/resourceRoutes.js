import express from "express";
import Resource from "../models/Resource.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import mongoose from "mongoose";

const router = express.Router();


// -------------------- GET RESOURCES --------------------
// Accessible by both admin & user (filters based on role)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role; // comes from JWT decoded in authMiddleware

    // Find resources that are visible to this role
    const resources = await Resource.find({ visibleTo: { $in: [userRole] } });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- UPLOAD RESOURCE (Admin only) --------------------
router.post(
  "/upload",
  authMiddleware,
  requireRole("admin"), // only admins can upload
  async (req, res) => {
    try {
      const { title, description, fileUrl, visibleTo, language } = req.body;

      const resource = new Resource({
        title,
        description,
        fileUrl,
        createdBy: req.user.id,
        visibleTo: visibleTo || ["admin", "user"], // default both
        language: language || "en",
      });

      await resource.save();
      res.status(201).json({ message: "Resource uploaded ✅", resource });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// -------------------- DELETE RESOURCE (Admin only) --------------------

router.delete("/:resourceId/delete", authMiddleware, requireRole("admin"), async(req,res)=>{
  try{
    const resourceId = req.params.resourceId;

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
  return res.status(400).json({ message: "Invalid resource ID" });
  }

    const resource = await Resource.findByIdAndDelete(resourceId);
    
    if(!resource)
    return res.status(404).json({message:"Resource not found"});

    return res.status(200).json({message:"Resource deleted successfully"});
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

export default router;
