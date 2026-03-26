import { Schema, Document, model } from "mongoose";

// Define an interface for the Tool document
interface StackInterface extends Document {
  stacksList: string[];
}

// Define the schema
const stackSchema: Schema<StackInterface> = new Schema(
  {
    stacksList: { type: [String], required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Define and export the model
const StackModel = model<StackInterface>("stack", stackSchema);

export default StackModel;
export type { StackInterface };
