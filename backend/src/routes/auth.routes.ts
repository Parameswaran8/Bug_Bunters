import { Router } from "express";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
// router.put("/setPassword", AuthController.setPassword);

export default router;
