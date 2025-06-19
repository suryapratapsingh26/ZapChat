// back/src/lib/emailService.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `ZapChat <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <p>Your ZapChat verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};