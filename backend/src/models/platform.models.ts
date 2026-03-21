import { Schema, Document, model } from "mongoose";

// Define an interface for the Tool document
interface PlatformInterface extends Document {
  platformList: string[];
}

// Define the schema
const platformSchema: Schema<PlatformInterface> = new Schema(
  {
    platformList: { type: [String], required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Define and export the model
const PlatformModel = model<PlatformInterface>("platform", platformSchema);

export default PlatformModel;
export type { PlatformInterface };
