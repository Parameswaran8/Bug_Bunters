import mongoose from "mongoose";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import BugModel from "../models/bug.models";

export default class BugController {
  // =========================================
  // ✅ PHASE I: CREATE / RAISE BUG(S)
  // =========================================
  static BugRaise = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const payload = Array.isArray(req.body) ? req.body : [req.body];
      const results: any[] = [];

      console.log("payload", payload);

      for (const bugData of payload) {
        try {
          const { toolInfo, reportedBy, assignedTester } = bugData;

          // Validate required fields
          if (!toolInfo?.toolId) {
            results.push({
              status: "error",
              message: "toolId is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.toolName) {
            results.push({
              status: "error",
              message: "toolName is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.toolDescription) {
            results.push({
              status: "error",
              message: "toolDescription is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.priority) {
            results.push({
              status: "error",
              message: "priority is required",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.bugDescription) {
            results.push({
              status: "error",
              message: "bugDescription is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.expectedResult) {
            results.push({
              status: "error",
              message: "expectedResult is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          if (!toolInfo?.actualResult) {
            results.push({
              status: "error",
              message: "actualResult is required in toolInfo",
              data: bugData,
            });
            continue;
          }

          // Check if bug with same tool and description already exists
          const existingBug = await BugModel.findOne({
            "phaseI_BugReport.toolInfo.toolId": toolInfo.toolId,
            "phaseI_BugReport.toolInfo.bugDescription": toolInfo.bugDescription,
            isActive: true,
          });

          if (existingBug) {
            results.push({
              status: "skipped",
              message: `Similar bug for '${toolInfo.toolName}' already exists`,
              bugId: existingBug.bugId,
              mongoId: existingBug._id,
            });
            continue;
          }

          // Create new bug
          const newBug = new BugModel({
            phaseI_BugReport: {
              toolInfo: {
                toolId: toolInfo.toolId,
                toolName: toolInfo.toolName,
                toolDescription: toolInfo.toolDescription,
                platform: toolInfo.platform || "",
                priority: toolInfo.priority,
                libraryName: toolInfo.libraryName || "",
                bugDescription: toolInfo.bugDescription,
                stepsToReproduce: toolInfo.stepsToReproduce || "",
                expectedResult: toolInfo.expectedResult,
                actualResult: toolInfo.actualResult,
                attachments:
                  toolInfo.attachments?.map((att: any) => ({
                    url: att.url,
                    fileName: att.fileName || "",
                    uploadedAt: att.uploadedAt || new Date(),
                  })) || [],
              },
              reportedBy: reportedBy.userId,
              assignedTester: assignedTester?.userId || undefined,
              reportedAt: new Date(),
            },
            bugPhaseNo: bugData.bugPhaseNo || 1,
            currentPhase: bugData.currentPhase,
            isActive: true,
            tags: bugData.tags || [],
          });

          const savedBug = await newBug.save();

          results.push({
            status: "created",
            message: "Bug raised successfully",
            bugId: savedBug.bugId,
            mongoId: savedBug._id,
            toolName: toolInfo.toolName,
            platform: toolInfo.platform || "Not Specified",
            priority: toolInfo.priority,
          });
        } catch (error: any) {
          console.log("Error raising bug:", error);
          results.push({
            status: "error",
            message: error.message,
            data: bugData,
          });
        }
      }

      const summary = {
        total: payload.length,
        created: results.filter((r) => r.status === "created").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        failed: results.filter((r) => r.status === "error").length,
      };

      const statusCode =
        summary.failed === payload.length
          ? HttpStatusCodes.BAD_REQUEST
          : HttpStatusCodes.OK;

      res.status(statusCode).json({
        message: "Batch bug raise operation completed",
        summary,
        results,
      });
    }
  );

  // =========================================
  // ✅ PHASE II: BUG CONFIRMATION
  // =========================================
  static ConfirmBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        id,
        testingInfo,
        testedBy,
        assignedDeveloper,
        bugPhaseNo,
        currentPhase,
      } = req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Validate required fields
      if (!testingInfo?.status) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "status is required",
        });
        return;
      }

      if (
        testingInfo.isConfirmed === undefined ||
        testingInfo.canReproduce === undefined
      ) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "isConfirmed and canReproduce flags are required",
        });
        return;
      }

      // Update Phase II
      bug.phaseII_BugConfirmation = {
        testingInfo: {
          status: testingInfo.status,
          isConfirmed: testingInfo.isConfirmed,
          canReproduce: testingInfo.canReproduce,
          forwardedToDev: testingInfo.forwardedToDev || false,
          remarks: testingInfo.remarks || "",
          attachments:
            testingInfo.attachments?.map((att: any) => ({
              url: att.url,
              fileName: att.fileName || "",
              uploadedAt: att.uploadedAt || new Date(),
            })) || [],
          sopFollowed: testingInfo.sopFollowed || [],
        },
        testedBy: testedBy?.userId || undefined,
        assignedDeveloper: assignedDeveloper?.userId || undefined,
        testedAt: new Date(),
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug confirmation completed",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ PHASE III: BUG ANALYSIS
  // =========================================
  static AnalyzeBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id, analysisInfo, analyzedBy, bugPhaseNo, currentPhase } =
        req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Validate required fields
      if (!analysisInfo?.status) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "status is required",
        });
        return;
      }

      // Update Phase III
      bug.phaseIII_BugAnalysis = {
        analysisInfo: {
          status: analysisInfo.status,
          rootCause: analysisInfo.rootCause || "",
          estimatedEffort: analysisInfo.estimatedEffort || "",
          affectedModules: analysisInfo.affectedModules || [],
          remarks: analysisInfo.remarks || "",
          attachments:
            analysisInfo.attachments?.map((att: any) => ({
              url: att.url,
              fileName: att.fileName || "",
              uploadedAt: att.uploadedAt || new Date(),
            })) || [],
          sopProvided: analysisInfo.sopProvided || [],
        },
        analyzedBy: analyzedBy?.userId || undefined,
        analyzedAt: new Date(),
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug analysis completed",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ PHASE IV: MAINTENANCE (FIX BUG)
  // =========================================
  static FixBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id, maintenanceInfo, fixedBy, bugPhaseNo, currentPhase } =
        req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Validate required fields
      if (!maintenanceInfo?.status) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "status is required",
        });
        return;
      }

      // Update Phase IV
      bug.phaseIV_Maintenance = {
        maintenanceInfo: {
          status: maintenanceInfo.status,
          fixDescription: maintenanceInfo.fixDescription || "",
          codeChanges: maintenanceInfo.codeChanges || "",
          remarks: maintenanceInfo.remarks || "",
          attachments:
            maintenanceInfo.attachments?.map((att: any) => ({
              url: att.url,
              fileName: att.fileName || "",
              uploadedAt: att.uploadedAt || new Date(),
            })) || [],
          sopProvided: maintenanceInfo.sopProvided || [],
        },
        fixedBy: fixedBy?.userId || undefined,
        fixedAt: new Date(),
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug fix completed",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ PHASE V: FINAL TESTING
  // =========================================
  static FinalTestBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        id,
        testingInfo,
        testedBy,
        approvedBy,
        bugPhaseNo,
        currentPhase,
      } = req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Validate required fields
      if (!testingInfo?.status) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "status is required",
        });
        return;
      }

      if (testingInfo.isFixed === undefined) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "isFixed flag is required",
        });
        return;
      }

      // Update Phase V
      bug.phaseV_FinalTesting = {
        testingInfo: {
          status: testingInfo.status,
          isFixed: testingInfo.isFixed,
          regressionTested: testingInfo.regressionTested || false,
          remarks: testingInfo.remarks || "",
          attachments:
            testingInfo.attachments?.map((att: any) => ({
              url: att.url,
              fileName: att.fileName || "",
              uploadedAt: att.uploadedAt || new Date(),
            })) || [],
        },
        testedBy: testedBy?.userId || undefined,
        approvedBy: approvedBy?.userId || undefined,
        testedAt: new Date(),
        approvedAt: approvedBy ? new Date() : undefined,
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Final testing completed",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ PHASE VI: DEPLOYMENT
  // =========================================
  static DeployBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id, deploymentInfo, deployedBy, bugPhaseNo, currentPhase } =
        req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Validate required fields
      if (!deploymentInfo?.environment) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "environment is required",
        });
        return;
      }

      if (!deploymentInfo?.deploymentType) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "deploymentType is required",
        });
        return;
      }

      // Update Phase VI
      bug.phaseVI_Deployment = {
        deploymentInfo: {
          environment: deploymentInfo.environment,
          deploymentType: deploymentInfo.deploymentType,
          remarks: deploymentInfo.remarks || "",
          sopFollowed: deploymentInfo.sopFollowed || [],
        },
        deployedBy: deployedBy?.userId || undefined,
        deployedAt: new Date(),
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug fix deployed successfully",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ PHASE VII: CLOSE BUG
  // =========================================
  static CloseBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id, closureInfo, closedBy, bugPhaseNo, currentPhase } = req.body;

      const bug = await BugController.findBugById(id);
      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
        });
        return;
      }

      // Update Phase VII
      bug.phaseVII_Closure = {
        closureInfo: {
          resolutionSummary: closureInfo?.resolutionSummary || "",
          lessonsLearned: closureInfo?.lessonsLearned || "",
          remarks: closureInfo?.remarks || "",
        },
        closedBy: closedBy?.userId || undefined,
        closedAt: new Date(),
      };

      // Update phase and phase number from frontend
      if (bugPhaseNo !== undefined) {
        bug.bugPhaseNo = bugPhaseNo;
      }
      if (currentPhase) {
        bug.currentPhase = currentPhase;
      }

      bug.isActive = false;

      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug closed successfully",
        bugId: updatedBug.bugId,
        currentPhase: updatedBug.currentPhase,
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ GET BUG LIST (ALL OR FILTERED)
  // =========================================
  static GetBugs = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const {
        currentPhase,
        toolId,
        toolName,
        platform,
        priority,
        isActive,
        reportedBy,
        bugId,
        tags,
      } = req.query;

      const filter: any = {};

      // Filter by current phase
      if (currentPhase) {
        filter.currentPhase = currentPhase;
      }

      // Filter by tool ID
      if (toolId) {
        filter["phaseI_BugReport.toolInfo.toolId"] = toolId;
      }

      // Filter by tool name
      if (toolName) {
        filter["phaseI_BugReport.toolInfo.toolName"] = {
          $regex: toolName,
          $options: "i",
        };
      }

      // Filter by platform
      if (platform) {
        filter["phaseI_BugReport.toolInfo.platform"] = platform;
      }

      // Filter by priority
      if (priority) {
        filter["phaseI_BugReport.toolInfo.priority"] = priority;
      }

      // Filter by active status
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      // Filter by reported by user
      if (reportedBy) {
        filter["phaseI_BugReport.reportedBy"] = reportedBy;
      }

      // Filter by bugId
      if (bugId) {
        filter.bugId = {
          $regex: bugId,
          $options: "i",
        };
      }

      // Filter by tags
      if (tags) {
        filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      }

      const bugs = await BugModel.find(filter).sort({ createdAt: -1 }).lean();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug list fetched successfully",
        count: bugs.length,
        filters: filter,
        results: bugs,
      });
    }
  );

  // =========================================
  // ✅ GET SINGLE BUG BY ID
  // =========================================
  static GetBugById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const bug = await BugController.findBugById(id);

      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
          bugId: id,
        });
        return;
      }

      res.status(HttpStatusCodes.OK).json({
        message: "Bug fetched successfully",
        result: bug,
      });
    }
  );

  // =========================================
  // ✅ GET BUG STATISTICS
  // =========================================
  static GetBugStatistics = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const totalBugs = await BugModel.countDocuments();
      const activeBugs = await BugModel.countDocuments({ isActive: true });
      const closedBugs = await BugModel.countDocuments({ isActive: false });

      // Count by phase
      const phaseDistribution = await BugModel.aggregate([
        {
          $group: {
            _id: "$currentPhase",
            count: { $sum: 1 },
          },
        },
      ]);

      // Count by priority
      const priorityDistribution = await BugModel.aggregate([
        {
          $group: {
            _id: "$phaseI_BugReport.toolInfo.priority",
            count: { $sum: 1 },
          },
        },
      ]);

      // Count by platform
      const platformDistribution = await BugModel.aggregate([
        {
          $group: {
            _id: "$phaseI_BugReport.toolInfo.platform",
            count: { $sum: 1 },
          },
        },
      ]);

      res.status(HttpStatusCodes.OK).json({
        message: "Bug statistics fetched successfully",
        statistics: {
          total: totalBugs,
          active: activeBugs,
          closed: closedBugs,
          byPhase: phaseDistribution,
          byPriority: priorityDistribution,
          byPlatform: platformDistribution,
        },
      });
    }
  );

  // =========================================
  // ✅ UPDATE BUG DETAILS (Generic Update)
  // =========================================
  static UpdateBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = req.body;

      const bug = await BugController.findBugById(id);

      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
          bugId: id,
        });
        return;
      }

      // Update bug with new data
      Object.assign(bug, updateData);
      const updatedBug = await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug updated successfully",
        result: updatedBug,
      });
    }
  );

  // =========================================
  // ✅ DELETE BUG (SOFT DELETE)
  // =========================================
  static DeleteBug = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const bug = await BugController.findBugById(id);

      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
          bugId: id,
        });
        return;
      }

      bug.isActive = false;
      await bug.save();

      res.status(HttpStatusCodes.OK).json({
        message: "Bug deleted (soft delete) successfully",
        bugId: bug.bugId,
      });
    }
  );

  // =========================================
  // 🔧 HELPER: FIND BUG BY ID OR BUGID
  // =========================================
  private static async findBugById(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await BugModel.findById(id);
    } else {
      return await BugModel.findOne({ bugId: id.toUpperCase() });
    }
  }
}
