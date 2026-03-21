import { Router } from "express";
import PlatformController from "../controllers/platform.controller";

const router = Router();

router.post("/update_platform", PlatformController.UpdatePlatforms);
router.get("/system_config", PlatformController.GetSystemConfig);

export default router;
