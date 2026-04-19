import Notification from "../models/notification.models";
import { Types } from "mongoose";

export const createNotification = async (data: {
  recipient: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type: "assignment" | "status_change" | "comment" | "other";
  title: string;
  message: string;
  link?: string;
}) => {
  try {
    console.log("Creating notification in DB...", {
      recipient: data.recipient,
      title: data.title,
      type: data.type
    });

    const notification = new Notification({
      recipient: new Types.ObjectId(data.recipient),
      sender: new Types.ObjectId(data.sender),
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
    });
    const saved = await notification.save();
    console.log("Notification saved successfully ID:", saved._id);
    return saved;
  } catch (error) {
    console.error("CRITICAL: Error creating notification:", error);
    return null;
  }
};
