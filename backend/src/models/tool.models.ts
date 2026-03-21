import { Schema, Document, model } from "mongoose";

// Define an interface for the Tool document
interface ToolInterface extends Document {
  toolName: string;
  toolDescription: string;
  testerId?: string;
  devId?: string;
  platform: string[];
  libraryName: string;
  htmlVersion: string;
  lastLibraryUpdate?: Date;
  lastHtmlUpdate?: Date;
  lastResolvedDev?: Date;
  lastResolvedTester?: Date;
  lastBugReport?: Date;
  SOP: string;
  ReleaseNotes: string;
  defaultPlatform: string;
}

// Define the schema
const toolSchema: Schema<ToolInterface> = new Schema(
  {
    toolName: { type: String, required: true, trim: true },
    toolDescription: { type: String, required: false, default: "" },
    testerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false,
      default: null,
    },
    devId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false,
      default: null,
    },
    platform: { type: [String], required: false, default: [] },
    libraryName: { type: String, required: false, default: "" },
    htmlVersion: { type: String, required: false, default: "" },
    lastLibraryUpdate: { type: Date, required: false, default: null },
    lastHtmlUpdate: { type: Date, required: false, default: null },
    lastResolvedDev: { type: Date, required: false, default: null },
    lastResolvedTester: { type: Date, required: false, default: null },
    lastBugReport: { type: Date, required: false, default: null },
    SOP: { type: String, required: false, default: "" },
    ReleaseNotes: { type: String, required: false, default: "" },
    defaultPlatform: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

// Define and export the model
const ToolModel = model<ToolInterface>("tool", toolSchema);

export default ToolModel;
export type { ToolInterface };
