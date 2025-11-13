import { Router } from "express";
import ResetPasswordController from "../controllers/resetpass.controller";

const router = Router();

router.post("/request", ResetPasswordController.RequestReset);
router.post("/verify", ResetPasswordController.VerifyOtp);
router.post("/password", ResetPasswordController.ResetPassword);

export default router;
