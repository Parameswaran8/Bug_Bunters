import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import BugModel from "../models/bug.models";
import { createNotification } from "../utils/notification";
import { uploadOnCloudinary } from "../utils/cloudinary";
import LogModel from "../models/logs.models";
import { logBugActivity, captureBugChanges } from "../utils/bugActivity";

export default class BugController {
  // =========================================
  // ✅ PHASE I: CREATE / RAISE BUG(S)
  // =========================================
  static BugRaise = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const payload = Array.isArray(req.body) ? req.body : [req.body];
      const results: any[] = [];
      const user = req.user; // Retrieved from Auth Middleware

      if (!user) {
        res.status(HttpStatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
        return;
      }

      console.log("BugRaise payload", payload);

      // Pre-fetch all potentially matching bugs to prevent N+1 Queries
      const toolIdsAndDescriptions = payload
        .filter(
          (b) =>
            b.toolInfo?.toolId &&
            b.toolInfo?.bugDescription &&
            b.toolInfo?.toolName &&
            b.toolInfo?.toolDescription &&
            b.toolInfo?.priority &&
            b.toolInfo?.expectedResult &&
            b.toolInfo?.actualResult
        )
        .map((b) => ({
          "phaseI_BugReport.toolInfo.toolId": b.toolInfo.toolId,
          "phaseI_BugReport.toolInfo.bugDescription": b.toolInfo.bugDescription,
          isActive: true,
        }));

      let existingBugs: any[] = [];

      if (toolIdsAndDescriptions.length > 0) {
        // Find existing matches to prevent duplicates
        existingBugs = await BugModel.find({ $or: toolIdsAndDescriptions }).lean();
      }

      // Check existence based on cached results (memory filtering vs repetitive DB trips)
      const isDuplicate = (toolId: string, bugDesc: string) => {
        return existingBugs.find(
          (eb) =>
            eb.phaseI_BugReport.toolInfo.toolId.toString() === toolId &&
            eb.phaseI_BugReport.toolInfo.bugDescription === bugDesc
        );
      };

      for (const bugData of payload) {
        try {
          const { toolInfo, assignedTester } = bugData;

          // 1. Validate required fields structurally
          const requiredInfo = [
            "toolId",
            "toolName",
            "toolDescription",
            "priority",
            "bugDescription",
            "expectedResult",
            "actualResult",
          ];

          const missingFields = requiredInfo.filter(
            (field) => !toolInfo || !toolInfo[field]
          );

          if (missingFields.length > 0) {
            results.push({
              status: "error",
              message: `Missing required toolInfo fields: ${missingFields.join(", ")}`,
              data: bugData,
            });
            continue;
          }

          // 2. Check for Duplicates (from memory check, saving network round trips!)
          const existingMatch = isDuplicate(
            toolInfo.toolId,
            toolInfo.bugDescription
          );

          if (existingMatch) {
            results.push({
              status: "skipped",
              message: `Similar bug for '${toolInfo.toolName}' already exists`,
              bugId: existingMatch.bugId,
              mongoId: existingMatch._id,
            });
            continue;
          }

          // 3. Save Bug with secure assigned reporter (User token auto-assign)
          const newBug = new BugModel({
            phaseI_BugReport: {
              toolInfo: {
                toolId: toolInfo.toolId,
                toolName: toolInfo.toolName,
                toolDescription: toolInfo.toolDescription,
                stack: toolInfo.stack || "",
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
              reportedBy: user._id, // Assign to the logged-in user automatically
              assignedTester: assignedTester?.userId || undefined,
              clientContext: bugData.clientContext || {},
              reportedAt: new Date(),
            },
            bugPhaseNo: bugData.bugPhaseNo || 1,
            currentPhase: bugData.currentPhase || "Bug Reported",
            isActive: true,
            tags: bugData.tags || [],
          });

          // Await save sequentially to guarantee sequential custom ID creation (BUG-XXXX hook)
          const savedBug = await newBug.save();

          // Trigger notification for assigned tester
          if (assignedTester?.userId) {
            await createNotification({
              recipient: assignedTester.userId,
              sender: user._id as string,
              type: "assignment",
              title: "New Bug Assigned",
              message: `You have been assigned as a tester for bug: ${savedBug.bugId}`,
              link: `/bugs/${savedBug._id}`,
            });
          }

          // Log Bug Creation
          await logBugActivity(
            savedBug._id,
            user._id,
            "Bug Created",
            JSON.stringify({
              toolName: toolInfo.toolName,
              bugId: savedBug.bugId,
              stack: toolInfo.stack || "Not Specified",
              priority: toolInfo.priority,
              bugDescription: toolInfo.bugDescription,
              expectedResult: toolInfo.expectedResult,
              actualResult: toolInfo.actualResult,
              assignedTester: assignedTester?.name || "None",
              currentPhase: savedBug.currentPhase,
              reportedBy: user.name || user.email
            }),
            "creation"
          );

          results.push({
            status: "created",
            message: "Bug raised successfully",
            bugId: savedBug.bugId,
            mongoId: savedBug._id,
            toolName: toolInfo.toolName,
            stack: toolInfo.stack || "Not Specified",
            priority: toolInfo.priority,
            bug: savedBug,
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

      // Adjust to what Axios expects to map directly
      res.status(statusCode).json({
        success: statusCode === HttpStatusCodes.OK,
        message: "Bug operation completed",
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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Bug Confirmation Updated",
          JSON.stringify(changes)
        );
      }

      // Trigger notification for assigned developer
      if (assignedDeveloper?.userId) {
        await createNotification({
          recipient: assignedDeveloper.userId,
          sender: (req as any).user?._id as string,
          type: "assignment",
          title: "Bug Assigned for Development",
          message: `You have been assigned as a developer for bug: ${updatedBug.bugId}`,
          link: `/bugs/${updatedBug._id}`,
        });
      }

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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Bug Analysis Updated",
          JSON.stringify(changes)
        );
      }

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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Bug Maintenance Updated",
          JSON.stringify(changes)
        );
      }

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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Final Testing Updated",
          JSON.stringify(changes)
        );
      }

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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Bug Deployed",
          JSON.stringify(changes)
        );
      }

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

      const oldBug = bug.toObject();
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          (req as any).user?._id,
          "Bug Closed",
          JSON.stringify(changes)
        );
      }

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
    async (_req: Request, res: Response): Promise<void> => {
      const {
        currentPhase,
        toolId,
        toolName,
        stack,
        priority,
        isActive,
        reportedBy,
        bugId,
        tags,
      } = _req.query as any;

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

      // Filter by stack
      if (stack) {
        filter["phaseI_BugReport.toolInfo.stack"] = stack;
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

      const bugs = await BugModel.find(filter)
        .populate("phaseI_BugReport.reportedBy", "name email")
        .populate("phaseI_BugReport.assignedTester", "name email")
        .populate("phaseII_BugConfirmation.assignedDeveloper", "name email")
        .sort({ createdAt: -1 })
        .lean();

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
      const id = req.params.id || req.body.id || req.body._id;

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
  // ✅ GET BUG ACTIVITY LOGS
  // =========================================
  static GetBugLogs = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.body;
      console.log("Fetching logs for ID:", id);
      let mongoId: any = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        mongoId = new mongoose.Types.ObjectId(id);
      } else {
        const bug = await BugModel.findOne({ bugId: id.toUpperCase() });
        if (bug) {
          mongoId = bug._id;
        }
      }

      if (!mongoId) {
        console.log("No valid bug found for ID:", id);
        res.status(HttpStatusCodes.OK).json({
          success: true,
          message: "No bug found for identifier",
          results: [],
        });
        return;
      }

      console.log("Searching LogModel with bugId:", mongoId);
      const logs = await LogModel.find({ 
        $or: [
          { bugId: mongoId },
          { bugId: mongoId.toString() }
        ]
      })
        .populate("performedBy", "name email")
        .sort({ timestamp: -1 })
        .lean();

      console.log(`Found ${logs.length} logs for bug ${mongoId}`);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Bug logs fetched successfully",
        results: logs,
      });
    }
  );

  // =========================================
  // ✅ GET BUG STATISTICS
  // =========================================
  static GetBugStatistics = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
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

      // Count by stack
      const stackDistribution = await BugModel.aggregate([
        {
          $group: {
            _id: "$phaseI_BugReport.toolInfo.stack",
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
          byStack: stackDistribution,
        },
      });
    }
  );

  // =========================================
  // ✅ UPDATE BUG DETAILS (Generic Update)
  // =========================================
  static UpdateBug = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const id = req.body.id || req.body._id;
      const updateData = req.body;
      const user = req.user;

      const bug = await BugController.findBugById(id);

      if (!bug) {
        res.status(HttpStatusCodes.NOT_FOUND).json({
          message: "Bug not found",
          bugId: id,
        });
        return;
      }

      // Track old assignments and phase to detect changes
      const oldPhase = bug.currentPhase;
      const oldTesterId = bug.phaseI_BugReport?.assignedTester?.toString();
      const oldDevId = bug.phaseII_BugConfirmation?.assignedDeveloper?.toString();

      console.log("UpdateBug tracking old:", { oldPhase, oldTesterId, oldDevId });

      // Update bug with new data
      const oldBug = bug.toObject();
      bug.set(updateData);
      const updatedBug = await bug.save();

      // Log activity
      const changes = captureBugChanges(oldBug, updatedBug.toObject());
      if (changes.length > 0) {
        await logBugActivity(
          updatedBug._id,
          user?._id,
          "Bug Updated",
          JSON.stringify(changes)
        );
      }

      // Trigger notifications if assignments or phases changed
      const newPhase = updatedBug.currentPhase;
      const newTesterId = updatedBug.phaseI_BugReport?.assignedTester?.toString();
      const newDevId = updatedBug.phaseII_BugConfirmation?.assignedDeveloper?.toString();
      const raiserId = updatedBug.phaseI_BugReport?.bugRaiser?.id;

      console.log("UpdateBug tracking new:", { newPhase, newTesterId, newDevId });

      const senderId = user?._id as string;

      // 1. Assignment Notifications (If IDs changed but phase might not have)
      if (newTesterId && newTesterId !== oldTesterId) {
        await createNotification({
          recipient: newTesterId,
          sender: senderId,
          type: "assignment",
          title: "Bug Assigned to You",
          message: `You have been assigned as a tester for bug ${updatedBug.bugId}`,
          link: `/bugs/${updatedBug._id}`,
        });
      }

      if (newDevId && newDevId !== oldDevId) {
        await createNotification({
          recipient: newDevId,
          sender: senderId,
          type: "assignment",
          title: "Development Assignment",
          message: `You have been assigned to analyze bug ${updatedBug.bugId}`,
          link: `/bugs/${updatedBug._id}`,
        });
      }

      // 2. Phase Transition Notifications
      if (newPhase !== oldPhase) {
        // Bug Reported -> Bug Testing
        if (oldPhase === "Bug Reported" && newPhase === "Bug Testing" && newTesterId) {
          await createNotification({
            recipient: newTesterId,
            sender: senderId,
            type: "status_change",
            title: "New Testing Task",
            message: `Bug ${updatedBug.bugId} moved to Testing phase. Please verify.`,
            link: `/bugs/${updatedBug._id}`,
          });
        }

        // Bug Testing -> Bug Analysis
        if (oldPhase === "Bug Testing" && newPhase === "Bug Analysis" && newDevId) {
          await createNotification({
            recipient: newDevId,
            sender: senderId,
            type: "status_change",
            title: "Bug for Analysis",
            message: `Bug ${updatedBug.bugId} confirmed and moved to Analysis phase.`,
            link: `/bugs/${updatedBug._id}`,
          });
        }

        // Bug Analysis -> Ready to Test
        if (oldPhase === "Bug Analysis" && newPhase === "Ready to Test" && newTesterId) {
          await createNotification({
            recipient: newTesterId,
            sender: senderId,
            type: "status_change",
            title: "Ready for Testing",
            message: `Fix for bug ${updatedBug.bugId} is ready to be tested.`,
            link: `/bugs/${updatedBug._id}`,
          });
        }

        // Ready to Test -> Bug Analysis (Re-opened/Failed)
        if (oldPhase === "Ready to Test" && newPhase === "Bug Analysis" && newDevId) {
          await createNotification({
            recipient: newDevId,
            sender: senderId,
            type: "status_change",
            title: "Bug Re-Analysis",
            message: `Testing failed for bug ${updatedBug.bugId}. Please re-analyze.`,
            link: `/bugs/${updatedBug._id}`,
          });
        }

        // Ready to Test -> Ready to Deploy
        if (oldPhase === "Ready to Test" && newPhase === "Ready to Deploy" && newDevId) {
          await createNotification({
            recipient: newDevId,
            sender: senderId,
            type: "status_change",
            title: "Ready for Deployment",
            message: `Bug ${updatedBug.bugId} passed testing and is ready for deploy.`,
            link: `/bugs/${updatedBug._id}`,
          });
        }

        // Ready to Deploy -> Closure
        if (oldPhase === "Ready to Deploy" && newPhase === "Closure") {
          const notifyList = [raiserId, newTesterId, newDevId].filter(Boolean);
          for (const recipientId of notifyList) {
            await createNotification({
              recipient: recipientId as string,
              sender: senderId,
              type: "status_change",
              title: "Bug Resolved",
              message: `Bug ${updatedBug.bugId} has been successfully deployed and closed.`,
              link: `/bugs/${updatedBug._id}`,
            });
          }
        }
      }

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
      const id = req.body.id || req.body._id;

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
  // 📁 FILE UPLOAD (CLOUDINARY)
  // =========================================
  static UploadFiles = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          message: "No files provided",
        });
        return;
      }

      const uploadResults = [];
      
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (result) {
          uploadResults.push({
            url: result.secure_url,
            fileName: file.originalname,
            publicId: result.public_id,
            size: file.size,
            uploadedAt: new Date(),
          });
        }
      }

      if (uploadResults.length === 0) {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to upload files to Cloudinary",
        });
        return;
      }

      res.status(HttpStatusCodes.OK).json({
        message: "Files uploaded successfully",
        results: uploadResults,
      });
    }
  );

  // =========================================
  // 🔧 HELPER: FIND BUG BY ID OR BUGID
  // =========================================
  private static async findBugById(id: string) {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? BugModel.findById(id)
      : BugModel.findOne({ bugId: id.toUpperCase() });

    return await query
      .populate("phaseI_BugReport.reportedBy", "name email")
      .populate("phaseI_BugReport.assignedTester", "name email")
      .populate("phaseII_BugConfirmation.assignedDeveloper", "name email")
      .populate("phaseIII_BugAnalysis.analyzedBy", "name email")
      .populate("phaseIV_Maintenance.fixedBy", "name email")
      .populate("phaseV_FinalTesting.testedBy", "name email")
      .populate("phaseV_FinalTesting.approvedBy", "name email");
  }
}
