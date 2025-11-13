import { Schema, Document, model, Types } from "mongoose";

// Define an interface for the Bug Log document
interface LogInterface extends Document {
  type: String;
  bugId: Types.ObjectId; // reference to Bug model
  toolId: Types.ObjectId; // reference to Bug model
  performedBy?: Types.ObjectId; // reference to User model
  action: string;
  details?: string;
  timestamp?: Date;
}

// Define the schema
const LogSchema = new Schema<LogInterface>(
  {
    type: { type: String, required: true, trim: true },
    bugId: { type: Schema.Types.ObjectId, ref: "bug", required: false },
    toolId: { type: Schema.Types.ObjectId, ref: "tool", required: false },
    performedBy: { type: Schema.Types.ObjectId, ref: "user" },

    action: { type: String, required: false, trim: false },
    details: { type: String, trim: true },
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

// Define and export the model
const LogModel = model<LogInterface>("log", LogSchema);

export default LogModel;
export type { LogInterface };
