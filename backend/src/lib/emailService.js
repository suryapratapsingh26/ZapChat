// back/src/lib/emailService.js
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter for Nodemailer using Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER, // Your Gmail address
		pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // Remove spaces from App Password
	},
});

// Generate 6-digit OTP
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
	try {
		await transporter.sendMail({
			from: `"ZapChat" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Your Verification Code",
			html: `
      <p>Your ZapChat verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `,
		});
		console.log("OTP email sent successfully to", email);
	} catch (error) {
		console.error("Error sending OTP email:", error.message);
		throw new Error("Failed to send OTP email.");
	}
};