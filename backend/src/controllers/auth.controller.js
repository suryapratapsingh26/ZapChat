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
				lastOtpSentAt: new Date(),
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
				isVerified: false,
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

// Send Password Reset OTP
export const sendPasswordResetOtp = async (req, res) => {
	try {
		console.log("Entering sendPasswordResetOtp controller.");
		const { email } = req.body;
		console.log("Email received for password reset:", email);
		const user = await User.findOne({ email });

		if (!user) {
			// To prevent user enumeration, we send a success response even if the user doesn't exist.
			console.log("No user found for this email. Sending generic success response.");
			return res.json({ message: "If a user with this email exists, an OTP has been sent." });
		}

		console.log("User found. Generating OTP for password reset.");
		const otp = generateOTP();
		const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
		console.log("Generated OTP:", otp);

		// Use findByIdAndUpdate to avoid triggering the pre-save password hash hook
		await User.findByIdAndUpdate(user._id, {
			otp,
			otpExpires,
		});
		console.log("User updated in DB with new OTP.");

		await sendOTPEmail(email, otp);
		console.log("Password reset OTP email send attempt initiated.");

		res.json({ message: "OTP sent successfully" });
		console.log("sendPasswordResetOtp controller finished successfully.");
	} catch (error) {
		console.log("Error in sendPasswordResetOtp controller:", error.message);
		res.status(500).json({ error: "Failed to send OTP" });
	}
};

// Verify Password Reset OTP
export const verifyPasswordResetOtp = async (req, res) => {
	try {
		const { email, otp } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "Invalid OTP or email" });
		}

		if (user.otp !== otp || user.otpExpires < new Date()) {
			return res.status(400).json({ error: "Invalid or expired OTP" });
		}

		// OTP is valid, but don't clear it yet. It's needed for the final reset step.
		res.json({ message: "OTP verified successfully" });
	} catch (error) {
		console.log("Error in verifyPasswordResetOtp controller:", error.message);
		res.status(500).json({ error: "Verification failed" });
	}
};

// Reset Password - CORRECTED VERSION
export const resetPassword = async (req, res) => {
	try {
		const { email, otp, newPassword } = req.body;

		if (newPassword.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters" });
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "Invalid request" });
		}

		if (user.otp !== otp || user.otpExpires < new Date()) {
			return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
		}

		// Set the new password. The pre-save hook in user.model.js will hash it.
		user.password = newPassword;
		user.otp = null; // Clear OTP after successful reset
		user.otpExpires = null;

		// Save the user. This will trigger the pre-save hook for hashing.
		await user.save();

		res.json({ message: "Password has been reset successfully" });
	} catch (error) {
		console.log("Error in resetPassword controller:", error.message);
		res.status(500).json({ error: "Failed to reset password" });
	}
};

// Register - CORRECTED VERSION
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

		// Update user with registration details
		user.fullName = fullName;
		user.password = password; // The pre-save hook will hash this
		user.otp = null;
		user.otpExpires = null;
		user.otpAttempts = 0;

		// Save the user. This will trigger the pre-save hook for hashing.
		await user.save();

		// Generate token
		generateToken(user._id, res);

		res.status(201).json({
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			profilePic: user.profilePic,
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
			createdAt: { $lt: oneDayAgo },
		});
		console.log(`Cleaned up ${result.deletedCount} unverified users older than 24 hours`);
		return result.deletedCount;
	} catch (error) {
		console.log("Error cleaning up unverified users:", error.message);
		return 0;
	}
};
