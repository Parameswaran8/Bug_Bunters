import { Router } from "express";
import AuthExtendController from "../controllers/authExtend.controller";

const router = Router();

router.post("/register", AuthExtendController.registerUserWithToken);
router.post("/update_user", AuthExtendController.UpdateUserWithToken);
// router.put("/setPassword", AuthExtendController.setPassword);

export default router;
