import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {connectDB} from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";


dotenv.config(
    // { path : '../.env'}
);
const PORT = process.env.PORT || 5000;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(limiter);

app.use(compression());
app.use(express.json({limit : '1mb'}));
app.use(express.urlencoded({extended:true, limit : '1mb'}));
app.use(cookieParser());

app.get("/ping", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("Chat API running 🚀");
});
app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack || err.message);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server running on port:", PORT);
    });
});
