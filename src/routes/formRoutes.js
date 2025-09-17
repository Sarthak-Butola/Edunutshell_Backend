import express from "express";
import Form from "../models/Form.js";
import {authMiddleware} from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import Response from "../models/Response.js";

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
      createdBy: req.user.id,
    });

    await newForm.save();

    res.status(201).json({ message: "Form created successfully ✅", form: newForm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET FORMS (role-based) --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role; // "user" or "admin"

    // Fetch forms assigned either to this role or to both
    const forms = await Form.find({
      $or: [{ assignedTo: userRole }, { assignedTo: "both" }],
    }).populate("createdBy", "name email"); // optional: show creator info

    res.status(200).json({ count: forms.length, forms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- SUBMIT FORM --------------------
router.post("/:formId/submit", authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body; // [{ fieldId, value }]

    // Validate form exists
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found ❌" });

    // Ensure answers correspond to valid fields in form
    const fieldIds = form.fields.map(f => f._id.toString());
    for (let ans of answers) {
      if (!fieldIds.includes(ans.fieldId.toString())) {
        return res.status(400).json({ message: `Invalid fieldId: ${ans.fieldId}` });
      }
    }

    // Save response
    const newResponse = new Response({
      formId,
      userId: req.user.id,
      answers,
    });

    await newResponse.save();

    res.status(201).json({ message: "Form submitted successfully ✅", response: newResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forms/:formId/responses
router.get("/:formId/responses", authMiddleware, async (req, res) => {
  try {
    const { formId } = req.params;

    // Fetch form to get questions
    const form = await Form.findById(formId).lean();
    if (!form) return res.status(404).json({ message: "Form not found ❌" });

    // Fetch responses for this form
    const responses = await Response.find({ formId })
      .populate("userId", "name email")
      .lean();

    // Map answers to labels
    const formatted = responses.map((resp) => ({
      user: resp.userId,
      submittedAt: resp.submittedAt,
      answers: resp.answers.map((ans) => {
        const field = form.fields.find(
          (f) => f._id.toString() === ans.fieldId.toString()
        );
        return {
          question: field ? field.label : "Unknown question",
          answer: ans.value,
        };
      }),
    }));

    res.json({ formTitle: form.title, responses: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
