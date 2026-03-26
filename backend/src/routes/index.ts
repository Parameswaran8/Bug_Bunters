import { Router } from "express";
import userRoutes from "./user.routes";
import toolRoutes from "./tool.routes";
import bugRoutes from "./bug.routes";
import stackRoutes from "./stack.routes";
import authRoutes from "./auth.routes";
import authExtend from "./authExtend.routes";
import credential from "./credential.routes";
import resetPassRoutes from "./resetpass.routes";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
// Routes that don't require authentication
router.use("/auth", authRoutes); // Register and login routes
router.use("/reset", resetPassRoutes); // Register and reset password with token...

// Middleware that checks for a valid token (authentication)
router.use(authenticateToken);
router.use("/authextend", authExtend); // Register new user/amdin with token...
router.use("/credential", credential); // Register and reset password with token...

// Routes that require authentication
router.use("/user", userRoutes);
router.use("/stack", stackRoutes); // Stack routes
router.use("/tools", toolRoutes); // Tool routes
router.use("/bug", bugRoutes); // Tool routes

export default router;
