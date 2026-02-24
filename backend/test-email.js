
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Manually load .env from the backend directory
dotenv.config();

console.log("----------------------------------------");
console.log("TESTING EMAIL CONFIGURATION");
console.log("Email User:", process.env.EMAIL_USER);
const rawPass = process.env.EMAIL_PASS || "";
const cleanPass = rawPass.replace(/\s+/g, '');
console.log("Password Length (Raw):", rawPass.length);
console.log("Password Length (Cleaned):", cleanPass.length);
console.log("Password First 2 Chars:", cleanPass.substring(0, 2));
console.log("----------------------------------------");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: cleanPass,
  },
});

async function verifyConnection() {
  try {
    console.log("Attempting to verify connection...");
    await transporter.verify();
    console.log("✅ SUCCESS: Connection to Gmail SMTP server verified!");
  } catch (error) {
    console.error("❌ ERROR: Connection failed.");
    console.error(error);
  }
}

verifyConnection();
