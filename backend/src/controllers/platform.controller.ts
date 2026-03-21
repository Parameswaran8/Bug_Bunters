import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import PlatformModel from "../models/platform.models";

export default class PlatformController {
  // Add or Update Tool Platforms
  static UpdatePlatforms = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { platformList } = req.body;

      if (!platformList || !platformList.length) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "Platform list is required" });
        return;
      }

      // Ensure platformList is always an array
      const platformsArray = Array.isArray(platformList) ? platformList : [platformList];
      // Check if a platform document already exists
      let existingPlatform = await PlatformModel.findOne();

      if (existingPlatform) {
        // Update existing platformList
        existingPlatform.platformList = platformsArray;
        await existingPlatform.save();
        res.status(HttpStatusCodes.OK).json({
          message: "Tool platforms updated successfully",
          platform: existingPlatform,
        });
      } else {
        // Create a new platform document
        const newPlatform = await PlatformModel.create({ platformList: platformsArray });
        res.status(HttpStatusCodes.CREATED).json({
          message: "Tool platforms added successfully",
          platform: newPlatform,
        });
      }
    }
  );

  // Get Global System Configuration (Platform List)
  static GetSystemConfig = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      try {
        const config = await PlatformModel.findOne();
        if (!config) {
          res.status(HttpStatusCodes.OK).json({ platformList: [] });
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
