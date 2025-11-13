import { Router } from "express";
import CredentialController from "../controllers/credential.controller";

const router = Router();

router.post("/cpass", CredentialController.ChangePassword);
// router.get('/getTools', ToolController.GetTools);

export default router;
