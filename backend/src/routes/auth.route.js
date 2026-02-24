import express from "express";
import {
  checkAuth,
  login,
  logout,
  register, 
  resetPassword,
  sendOtp,
  sendPasswordResetOtp,
  updateProfile,
  verifyOtp,
  verifyPasswordResetOtp,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-password-reset-otp", sendPasswordResetOtp);
router.post("/verify-password-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);

router.post("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;
