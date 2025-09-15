import express from "express";
import Form from "../models/Form.js";
import {authMiddleware} from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// @desc    Create a new form
// @route   POST /api/forms
// @access  Admin
router.post("/create", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, fields, assignedTo } = req.body;

    // Validate at least one field
    if (!fields || fields.length === 0) {
      return res.status(400).json({ message: "Form must have at least one field ❌" });
    }

    const newForm = new Form({
      title,
      description,
      fields,
      assignedTo,
      createdBy: req.user.id, // from auth middleware
    });

    await newForm.save();

    res.status(201).json({ message: "Form created successfully ✅", form: newForm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
