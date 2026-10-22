import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, deleteMessage } from "../controllers/message.controller.js";
import upload from "../middleware/upload.js";
import { validate, getMessagesSchema, sendMessageSchema, deleteMessageSchema } from "../middleware/validate.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/send/:id", protectRoute, upload.single("image"), validate(sendMessageSchema), sendMessage);
router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages);
router.delete("/:id", protectRoute, validate(deleteMessageSchema), deleteMessage);

export default router;