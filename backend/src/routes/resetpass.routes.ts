import { Router } from "express";
import ResetPasswordController from "../controllers/resetpass.controller";
import { authRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.use(authRateLimiter);

router.post("/request", ResetPasswordController.RequestReset);
router.post("/verify", ResetPasswordController.VerifyOtp);
router.post("/password", ResetPasswordController.ResetPassword);

export default router;
