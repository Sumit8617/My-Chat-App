import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {connectDB} from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./lib/socket.js";
import compression from "compression";



dotenv.config(
    // { path : '../.env'}
);
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

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

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server running on port:", PORT);
    });
});
