import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());    

// Test root route
app.get("/", (req, res) => {
  res.send("API is running ✅");
});

// Mount user routes
app.use("/api/users", userRoutes);

export default app;
