import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import http from "http";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { initializeSocket } from "./lib/socket.js";

const app = express();
const server = http.createServer(app);
// Initialize socket.io and pass the server instance
initializeSocket(server);

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// Trust the first proxy
app.set("trust proxy", 1);

// Increase payload size limit
app.use(express.json({ limit: "10mb" })); // For JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true })); // For URL-encoded data

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://zap-chat-pheh.onrender.com"],
    credentials: true,
  })
);

// ADD THIS MIDDLEWARE TO LOG ALL INCOMING REQUESTS
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});
// END OF ADDED MIDDLEWARE

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});