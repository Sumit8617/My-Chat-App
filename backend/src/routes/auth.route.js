import express from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate, signupSchema, loginSchema, updateProfileSchema } from "../middleware/validate.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, validate(updateProfileSchema), updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;