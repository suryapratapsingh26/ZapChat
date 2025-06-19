import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { generateOTP, sendOTPEmail } from "../lib/emailService.js";

// Send OTP - FIXED VERSION
export const sendOtp = async (req, res) => {
  try {
    console.log("Entering sendOtp controller.");
    const { email } = req.body;
    console.log("Email received in sendOtp:", email);

    // Check if email already registered and verified
    const existingUser = await User.findOne({ email });
    console.log("Existing user check result:", existingUser);

    if (existingUser?.isVerified) {
      console.log("Email already in use and verified. Returning 400.");
      return res.status(400).json({ error: "Email already in use" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log("Generated OTP:", otp, "Expires:", otpExpires);

    if (existingUser) {
      // Update existing unverified user
      await User.findByIdAndUpdate(existingUser._id, {
        otp,
        otpExpires,
        otpAttempts: existingUser.otpAttempts + 1,
        lastOtpSentAt: new Date()
      });
      console.log("Updated existing unverified user for email:", email);
    } else {
      // Create new temporary user record
      await User.create({
        email,
        otp,
        otpExpires,
        otpAttempts: 1,
        lastOtpSentAt: new Date(),
        // Add temporary placeholder values to satisfy schema requirements
        fullName: "TEMP_USER", // This will be replaced during registration
        password: "TEMP_PASSWORD", // This will be replaced during registration
        isVerified: false
      });
      console.log("Created new temporary user for email:", email);
    }

    // Send email
    await sendOTPEmail(email, otp);
    console.log("OTP email send attempt initiated for:", email);

    res.json({ message: "OTP sent successfully" });
    console.log("sendOtp controller finished successfully for:", email);
  } catch (error) {
    console.log("Error in sendOtp controller (catch block):", error.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Verify OTP - UNCHANGED
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("Verify OTP request received for email:", email);
    console.log("Received OTP (from frontend):", otp, "Type:", typeof otp);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("Error: Email not found for verification.");
      return res.status(400).json({ error: "Email not found" });
    }
    console.log("User found. Stored OTP:", user.otp, "Type:", typeof user.otp);
    console.log("Stored OTP Expires:", user.otpExpires);

    // Check OTP validity
    if (user.otp !== otp) {
      console.log("Error: OTP mismatch. Stored:", user.otp, "Received:", otp);
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (user.otpExpires < new Date()) {
      console.log("Error: OTP expired.");
      return res.status(400).json({ error: "OTP expired" });
    }

    // Mark as verified using findByIdAndUpdate to avoid schema validation issues
    await User.findByIdAndUpdate(
      user._id,
      {
        isVerified: true,
        otp: null,
        otpExpires: null,
      },
      { new: true }
    );
    console.log("Email verified successfully for:", email);

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.log("Error in verifyOtp controller (catch block):", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Register - FIXED VERSION (Password Hashing Issue)
export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if email is verified
    const user = await User.findOne({ email });
    if (!user?.isVerified) {
      return res.status(400).json({ error: "Email not verified" });
    }

    // Manually hash the password to ensure it's properly hashed
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with registration details
    await User.findByIdAndUpdate(user._id, {
      fullName,
      password: hashedPassword, // Use manually hashed password
      otp: null,
      otpExpires: null,
      otpAttempts: 0
    });

    // Fetch updated user
    const updatedUser = await User.findById(user._id);

    // Generate token
    generateToken(updatedUser._id, res);

    res.status(201).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
    });
  } catch (error) {
    console.log("Error in register controller", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login - UNCHANGED
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout - UNCHANGED
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Profile - UNCHANGED
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check Auth - UNCHANGED
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// OPTIONAL: Cleanup function for abandoned registrations
export const cleanupUnverifiedUsers = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneDayAgo }
    });
    console.log(`Cleaned up ${result.deletedCount} unverified users older than 24 hours`);
    return result.deletedCount;
  } catch (error) {
    console.log("Error cleaning up unverified users:", error.message);
    return 0;
  }
};