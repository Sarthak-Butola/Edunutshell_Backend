import express from "express";
import Ticket from "../models/Ticket.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// POST /api/tickets/create
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required ❌" });
    }

    const ticket = new Ticket({
      userId: req.user.id,
      subject,
      responses: [
        {
          by: { id: req.user.id, role: req.user.role },
          message,
          at: new Date(),
        },
      ],
    });

    await ticket.save();
    res.status(201).json({ message: "Ticket created ✅", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tickets/user/:id
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Only the user themselves OR admin can view
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const tickets = await Ticket.find({ userId: id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PATCH /api/tickets/:id/close
router.patch("/:id/close", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found ❌" });

    ticket.status = "closed";
    ticket.responses.push({
      by: { id: req.user.id, role: "admin" },
      message: "Ticket closed by admin",
      at: new Date(),
    });

    await ticket.save();
    res.json({ message: "Ticket closed ✅", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;