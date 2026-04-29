import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import Notification from "../models/notification.models";

export default class NotificationController {
  // Get all notifications for the logged-in user
  static GetNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "name email photo");

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    console.log(`Found ${notifications.length} notifications (${unreadCount} unread)`);

    res.status(HttpStatusCodes.OK).json({
      notifications,
      unreadCount,
    });
  });

  // Mark a specific notification as read
  static MarkAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ message: "Notification not found" });
      return;
    }

    res.status(HttpStatusCodes.OK).json({ message: "Notification marked as read" });
  });

  // Mark all notifications as read
  static MarkAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;

    if (!userId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    res.status(HttpStatusCodes.OK).json({ message: "All notifications marked as read" });
  });

  // Delete a notification
  static DeleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
      return;
    }

    await Notification.findOneAndDelete({ _id: id, recipient: userId });

    res.status(HttpStatusCodes.OK).json({ message: "Notification deleted" });
  });
}
