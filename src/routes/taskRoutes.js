import express from "express";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();


// -------------------- GET USER TASKS --------------------
// GET /api/tasks/:userId
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

  // Allow if the user is fetching their own tasks OR if they are admin
  if (req.user.id.toString() === userId.toString() || req.user.role === "admin") {
  const tasks = await Task.find({ assignedTo: userId });
  return res.json(tasks);
}
// Otherwise, deny access
return res.status(403).json({ message: "Access denied ❌" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- CREATE TASK (ADMIN ONLY) --------------------
// POST /api/tasks/create
router.post(
  "/create",
  authMiddleware,
  requireRole("admin"), // only admins
  async (req, res) => {
    try {
      const { title, description, dueDate, assignedTo, team, type, picture } = req.body;

      const newTask = new Task({
        title,
        description,
        dueDate,
        assignedTo,
        team,
        type,
        picture,
        status: "pending",
      });

      await newTask.save();
      res.status(201).json({ message: "Task created successfully ✅", task: newTask });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// -------------------- UPDATE TASK STATUS (USER) --------------------
// PATCH /api/tasks/:taskId/status
router.patch("/:taskId/status", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // e.g. "in-progress" or "completed"

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found ❌" });

    // Ensure only the assigned user (or admin) can update
    if (task.assignedTo.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this task ❌" });
    }

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated ✅", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
