// back/src/lib/emailService.js
import nodemailer from "nodemailer";
import crypto from "crypto";

// Create a transporter for Nodemailer using Gmail SMTP with OAuth2
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: process.env.GMAIL_USER, // Your Gmail address
		clientId: process.env.OAUTH_CLIENT_ID, // Your Client ID
		clientSecret: process.env.OAUTH_CLIENT_SECRET, // Your Client Secret
		refreshToken: process.env.OAUTH_REFRESH_TOKEN, // Your Refresh Token
	},
});

// Generate 6-digit OTP
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
	try {
		await transporter.sendMail({
			from: `"ZapChat" <${process.env.GMAIL_USER}>`,
			to: email,
			subject: "Your Verification Code",
			html: `
      <p>Your ZapChat verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `,
		});
		console.log("OTP email sent successfully to", email, "via Nodemailer/Gmail");
	} catch (error) {
		console.error("Error sending OTP email via Nodemailer/Gmail:", error.message);
		throw new Error("Failed to send OTP email.");
	}
};