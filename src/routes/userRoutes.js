import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

// Simple test route
router.get("/hello", (req, res) => {
  res.json({ message: "User API working ✅" });
});

// Create user (for testing)
// Signup, only admin can add new users
router.post("/signup", authMiddleware,requireRole("admin") , async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully ✅" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists ❌" });
    }
    res.status(500).json({ error: err.message });
  }
});


// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Create Access Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // short-lived
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // long-lived
    );

    // Send refreshToken as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: "strict",
    });

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- REFRESH --------------------
router.post("/refresh", (req, res) => {
  try{
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: decoded.id, role:decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  });
}catch(err){
   res.status(500).json({ error: err.message });
}
});


// -------------------- LOGOUT --------------------
router.post("/logout", (req, res) => {
  try{
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully ✅" });
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;