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
const PORT = process.env.PORT;

app.use(compression());
app.use(express.json({
    limit : '1mb'
}));
app.use(express.urlencoded({extended:true, limit : '1mb'}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))


app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server running on port:", PORT);
    });
});
