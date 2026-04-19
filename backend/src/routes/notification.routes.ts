import { Router } from "express";
import NotificationController from "../controllers/notification.controller";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenticateToken);

router.get("/", NotificationController.GetNotifications);
router.patch("/:id/read", NotificationController.MarkAsRead);
router.patch("/read-all", NotificationController.MarkAllAsRead);
router.delete("/:id", NotificationController.DeleteNotification);

export default router;
