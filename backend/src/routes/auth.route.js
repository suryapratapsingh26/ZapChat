import express from "express";
import {
  checkAuth,
  login,
  logout,
  register,
  sendOtp,
  verifyOtp,
  updateProfile,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { otpRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-password-reset-otp", otpRateLimiter, sendPasswordResetOtp);
router.post("/verify-password-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;