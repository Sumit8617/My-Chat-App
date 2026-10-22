import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controller.js";
import upload from "../middleware/upload.js";
import { validate, getMessagesSchema, sendMessageSchema } from "../middleware/validate.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:id", protectRoute, upload.single("image"), validate(sendMessageSchema), sendMessage);
router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages);


export default router;