// back/src/lib/emailService.js
import { Resend } from "resend";
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate 6-digit OTP
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
	try {
		await resend.emails.send({
			from: "ZapChat <onboarding@resend.dev>", // Use Resend's default sending address
			to: email,
			subject: "Your Verification Code",
			html: `
      <p>Your ZapChat verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `,
		});
		console.log("OTP email sent successfully to", email, "via Resend");
	} catch (error) {
		console.error("Error sending OTP email via Resend:", error);
		throw new Error("Failed to send OTP email.");
	}
};