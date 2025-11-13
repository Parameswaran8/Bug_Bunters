import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import Log from "../models/logs.models";
import mongoose from "mongoose";

class LogController {
  // ✅ Get timeline logs for a specific bug or tool
  static getTimeline = asyncHandler(async (req: Request, res: Response) => {
    const { bugId, toolId, limit = 50, skip = 0 } = req.body;

    // Validate that at least one ID is provided
    if (!bugId && !toolId) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Either bugId or toolId is required",
      });
      return; // ✅ just return (don’t return res)
    }

    // Build query filter
    const filter: any = {};
    if (bugId) filter.bugId = new mongoose.Types.ObjectId(bugId);
    if (toolId) filter.toolId = new mongoose.Types.ObjectId(toolId);

    // Fetch logs with population
    const logs = await Log.find(filter)
      .populate("performedBy", "name email")
      .populate("bugId", "title status")
      .populate("toolId", "name")
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    // Get total count for pagination
    const totalCount = await Log.countDocuments(filter);

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: "Timeline fetched successfully",
      data: {
        logs,
        pagination: {
          total: totalCount,
          limit: Number(limit),
          skip: Number(skip),
          hasMore: totalCount > Number(skip) + logs.length,
        },
      },
    });
  });

  // ✅ Delete timeline logs
  static deleteTimeline = asyncHandler(async (req: Request, res: Response) => {
    const { logIds, bugId, toolId, deleteAll } = req.body;

    // Option 1: Delete specific log entries by their IDs
    if (logIds && Array.isArray(logIds) && logIds.length > 0) {
      const result = await Log.deleteMany({
        _id: { $in: logIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `${result.deletedCount} log(s) deleted successfully`,
        data: { deletedCount: result.deletedCount },
      });
      return;
    }

    // Option 2: Delete all logs for a specific bug or tool
    if (deleteAll && (bugId || toolId)) {
      const filter: any = {};
      if (bugId) filter.bugId = new mongoose.Types.ObjectId(bugId);
      if (toolId) filter.toolId = new mongoose.Types.ObjectId(toolId);

      const result = await Log.deleteMany(filter);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: `All logs deleted successfully`,
        data: { deletedCount: result.deletedCount },
      });
      return;
    }

    // No valid deletion criteria provided
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Please provide logIds or set deleteAll with bugId/toolId",
    });
  });
}

export default new LogController();
