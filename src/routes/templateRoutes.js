import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import TaskTemplate from "../models/TaskTemplate.js";


const router = express.Router();


// -------------------- CREATE TEMPLATE (ADMIN) --------------------
// POST /api/templates/create
router.post("/create", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { name, category, tasks } = req.body;

    const newTemplate = new TaskTemplate({
      name,
      category,
      tasks,
      createdBy: req.user.id,
    });

    await newTemplate.save();
    res.status(201).json({ message: "Template created ✅", template: newTemplate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- GET ALL TEMPLATES --------------------
// GET /api/templates
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const templates = await TaskTemplate.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- ASSIGN TEMPLATE TO USER --------------------
// POST /api/templates/:templateId/assign/:userId
router.post("/:templateId/assign/:userId", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { templateId, userId } = req.params;

    const template = await TaskTemplate.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found ❌" });

    const generatedTasks = template.tasks.map(t => ({
      title: t.title,
      description: t.description,
      type: t.type,
      assignedTo: userId,
      dueDate: t.dueAfterDays
        ? new Date(Date.now() + t.dueAfterDays * 24 * 60 * 60 * 1000)
        : null,
      status: "pending",
    }));

    // Insert many tasks at once
    const createdTasks = await Task.insertMany(generatedTasks);

    res.status(201).json({
      message: `Template assigned ✅ ${createdTasks.length} tasks created`,
      tasks: createdTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
