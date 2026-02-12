import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar,getMessages,sendMessage } from "../controllers/message.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar)

router.post ("/send/:id", protectRoute,upload.single("image"), sendMessage);

router.get("/:id", protectRoute, getMessages)


export default router;