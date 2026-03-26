import { Router } from "express";
import StackController from "../controllers/stack.controller";

const router = Router();

router.post("/update_stack", StackController.UpdateStacks);
router.get("/system_config", StackController.GetSystemConfig);

export default router;
