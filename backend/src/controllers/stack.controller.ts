import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import StackModel from "../models/stack.models";

export default class StackController {
  // Add or Update Tool Stacks
  static UpdateStacks = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { stacksList } = req.body;

      if (!stacksList || !stacksList.length) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Stack list is required" });
        return;
      }

      // Ensure stacksList is always an array
      const stacksArray = Array.isArray(stacksList) ? stacksList : [stacksList];
      // Check if a stack document already exists
      let existingStack = await StackModel.findOne();

      if (existingStack) {
        // Update existing stacksList
        existingStack.stacksList = stacksArray;
        await existingStack.save();
        res.status(HttpStatusCodes.OK).json({
          message: "Tool stacks updated successfully",
          stack: existingStack,
        });
      } else {
        // Create a new stack document
        const newStack = await StackModel.create({ stacksList: stacksArray });
        res.status(HttpStatusCodes.CREATED).json({
          message: "Tool stacks added successfully",
          stack: newStack,
        });
      }
    }
  );

  // Get Global System Configuration (Stack List)
  static GetSystemConfig = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const config = await StackModel.findOne();
        if (!config) {
          res.status(HttpStatusCodes.OK).json({ stacksList: [] });
          return;
        }

        res.status(HttpStatusCodes.OK).json(config);
      } catch (error) {
        res
          .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to fetch system config", error });
      }
    }
  );
}
