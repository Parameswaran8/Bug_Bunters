import { Schema, Document, model, Types } from "mongoose";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: "assignment" | "status_change" | "comment" | "other";
  title: string;
  message: string;
  link?: string; // e.g., link to the bug
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "user", required: true },
    type: {
      type: String,
      enum: ["assignment", "status_change", "comment", "other"],
      default: "other",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Notification = model<INotification>("notification", notificationSchema);
export default Notification;
