import { Router } from "express";
import ToolController from "../controllers/tool.controller";

const router = Router();

router.post("/update_tool", ToolController.UpdateTool);
router.get("/getTools", ToolController.GetTools);

export default router;
