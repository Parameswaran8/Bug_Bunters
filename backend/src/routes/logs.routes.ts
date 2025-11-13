import { Router } from "express";
import ToolController from "../controllers/tool.controller";

const router = Router();

router.post("/get_timeline", ToolController.UpdateTool);
router.post("/delete_timeline", ToolController.UpdateTool);

export default router;
