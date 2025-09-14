import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { startEmailReminderJob } from "./jobs/emailReminderJob.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB(); // ✅ wait for DB connection
    console.log("MongoDB connected ✅");

    // Start cron AFTER DB is ready
    startEmailReminderJob();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
};

startServer();
