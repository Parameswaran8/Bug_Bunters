import { Router } from "express";
import BugController from "../controllers/bug.controller";
import { upload } from "../middlewares/multer";

const router = Router();

router.post("/upload", upload.array("files", 5), BugController.UploadFiles);

router.post("/bug_create", BugController.BugRaise);
router.post("/bug_confirm", BugController.ConfirmBug);
router.post("/bug_Analyze", BugController.AnalyzeBug);
router.post("/bug_Fix", BugController.FixBug);
router.post("/bug_FinalTest", BugController.FinalTestBug);
router.post("/bug_Deploy", BugController.DeployBug);
router.post("/bug_Close", BugController.CloseBug);

router.post("/get_bugs", BugController.GetBugs);
router.post("/get_BugById", BugController.GetBugById);
router.post("/get_BugStatistics", BugController.GetBugStatistics);

router.post("/update_Bug", BugController.UpdateBug);
router.post("/delete_Bug", BugController.DeleteBug);
router.post("/get_BugLogs", BugController.GetBugLogs);

// router.get("/bug_update", BugController.BugUpdate);

export default router;
