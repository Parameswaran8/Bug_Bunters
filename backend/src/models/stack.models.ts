import { Schema, Document, model } from "mongoose";

// Define an interface for the Tool document
interface StackInterface extends Document {
  stackList: string[];
}

// Define the schema
const stackSchema: Schema<StackInterface> = new Schema(
  {
    stackList: { type: [String], required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

// Define and export the model
const StackModal = model<StackInterface>("stack", stackSchema);

export default StackModal;
export type { StackInterface };
