import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import StackModal from "../models/stack.models"; // Your schema

export default class StackController {
  // Add or Update Tool Stacks
  static UpdateStacks = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { stackList } = req.body;

      if (!stackList || !stackList.length) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Stack list is required" });
        return;
      }

      // Ensure stackList is always an array
      const stacksArray = Array.isArray(stackList) ? stackList : [stackList];
      // Check if a stack document already exists
      let existingStack = await StackModal.findOne();

      if (existingStack) {
        // Update existing stackList
        existingStack.stackList = stacksArray;
        await existingStack.save();
        res.status(HttpStatusCodes.OK).json({
          message: "Tool stacks updated successfully",
          stack: existingStack,
        });
      } else {
        // Create a new stack document
        const newStack = await StackModal.create({ stackList: stacksArray });
        res.status(HttpStatusCodes.CREATED).json({
          message: "Tool stacks added successfully",
          stack: newStack,
        });
      }
    }
  );
}
