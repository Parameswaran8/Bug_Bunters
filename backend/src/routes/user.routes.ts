import { Router } from "express";
import UserController from "../controllers/user.controller";

const router = Router();

router.get("/update_user", UserController.UpdateUserWithToken);

export default router;
