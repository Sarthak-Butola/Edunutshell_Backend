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
    const { name, email, password, role, phone, startDate, jobTitle} = req.body;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      phone,
      startDate,
      jobTitle
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully ✅", 
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, jobTitle: newUser.jobTitle,
              phone:newUser.phone, startDate:newUser.startDate
       }
     });
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
      { expiresIn: "1h" } // short-lived
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role},
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" } // long-lived
    );

    // Send refreshToken as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: "strict",
    });

    res.json({ accessToken,
      user: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        email:user.email,
        id:user._id,
        jobTitle:user.jobTitle,
        startDate:user.startDate
      },
      });
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
      { expiresIn: "1h" }
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

// -------------------- UPDATE PROFILE (USER) --------------------
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Only allow these fields
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,   // comes from JWT
      { $set: updates },
      { new: true, runValidators: true } // returns updated doc
    ).select("-passwordHash"); // don't send password back

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- GET ALL USERS (ADMIN ONLY) --------------------
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // don’t expose password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET USER BY ID (ADMIN ONLY) --------------------
router.get("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found ❌" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- CHANGE PASSWORD --------------------
router.patch("/changePassword", authMiddleware, async (req, res) => {
  try {
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required" });
    }

    // 2. Password strength check
    if (newPassword.trim().length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ 
      message: "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character"
    });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Incorrect current password" });


    const salt = await bcrypt.genSalt(10);

    const cleanedNewPassword = newPassword.trim();
    user.passwordHash = await bcrypt.hash(cleanedNewPassword, salt);

    await user.save();

    res.status(200).json({ message: "Password changed successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;