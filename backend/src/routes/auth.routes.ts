import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.use(authRateLimiter);

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logout);

// router.put("/setPassword", AuthController.setPassword);

export default router;
