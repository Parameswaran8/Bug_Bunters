import { Router } from "express";
import StackController from "../controllers/stack.controller";

const router = Router();

router.post("/update_stack", StackController.UpdateStacks);
export default router;
