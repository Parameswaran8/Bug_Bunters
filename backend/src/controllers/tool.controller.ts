import mongoose from "mongoose";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatusCodes } from "../utils/errorCodes";
import Tool from "../models/tool.models";

interface ToolPayload {
  toolName?: string;
  toolDescription?: string;
  testerId?: string;
  devId?: string;
  stack?: string[] | string;
  libraryName?: string;
  htmlVersion?: string;
  lastLibraryUpdate?: Date | string | null;
  lastHtmlUpdate?: Date | string | null;
  lastResolvedDev?: Date | string | null;
  lastResolvedTester?: Date | string | null;
  lastBugReport?: Date | string | null;
  SOP?: string;
  ReleaseNotes?: string;
  [key: string]: any;
}

type BatchStatus = "created" | "updated" | "skipped" | "error";

interface BatchResult {
  toolName?: string;
  status: BatchStatus;
  tool?: any;
  error?: any;
  details?: any;
}

export default class ToolController {
  static UpdateTool = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Normalize input: prefer body.tools, else the body itself (array or single)
      const body = req.body ?? {};
      const payloadCandidate = body.tools ?? body;
      const toolItems: ToolPayload[] = Array.isArray(payloadCandidate)
        ? payloadCandidate
        : [payloadCandidate];

      if (!toolItems.length) {
        res
          .status(HttpStatusCodes.BAD_REQUEST)
          .json({ message: "No tool data provided" });
        return;
      }

      // mergeStacks flag default true; set mergeStacks=false to replace stack arrays
      const mergeStacksFlag =
        String(req.query.mergeStacks ?? "true") !== "false";

      // helper to sanitize ObjectId fields
      const safeObjectId = (id: any): string | undefined => {
        if (id === undefined || id === null || id === "") return undefined;
        if (typeof id === "string" && mongoose.isValidObjectId(id)) return id;
        if (
          id &&
          typeof id === "object" &&
          (id as any)._bsontype === "ObjectID"
        )
          return id;
        return undefined;
      };

      const results: BatchResult[] = [];

      // Pre-fetch existing tools (by names present) to minimize DB roundtrips
      const namesToFetch = toolItems
        .map((t) =>
          t && typeof t.toolName === "string" ? t.toolName : undefined
        )
        .filter(Boolean) as string[];

      const existingTools = namesToFetch.length
        ? await Tool.find({ toolName: { $in: namesToFetch } }).lean()
        : [];
      const existingMap = new Map<string, any>();
      existingTools.forEach((t) => existingMap.set(t.toolName, t));

      // Process sequentially for deterministic merging
      for (const item of toolItems) {
        const toolName = item?.toolName;
        if (!toolName || typeof toolName !== "string") {
          results.push({
            status: "error",
            error: "toolName is required",
            details: item,
          });
          continue;
        }

        try {
          const existing =
            existingMap.get(toolName) ?? (await Tool.findOne({ toolName }));

          // Build setOps for non-stack fields
          const setOps: Record<string, any> = {};
          if (typeof item.toolDescription !== "undefined")
            setOps.toolDescription = item.toolDescription;

          // sanitize testerId and devId
          const tester = safeObjectId(item.testerId);
          if (tester) setOps.testerId = tester;

          const dev = safeObjectId(item.devId);
          if (dev) setOps.devId = dev;

          if (typeof item.libraryName !== "undefined")
            setOps.libraryName = item.libraryName;
          if (typeof item.htmlVersion !== "undefined")
            setOps.htmlVersion = item.htmlVersion;
          if (typeof item.lastLibraryUpdate !== "undefined")
            setOps.lastLibraryUpdate = item.lastLibraryUpdate;
          if (typeof item.lastHtmlUpdate !== "undefined")
            setOps.lastHtmlUpdate = item.lastHtmlUpdate;
          if (typeof item.lastResolvedDev !== "undefined")
            setOps.lastResolvedDev = item.lastResolvedDev;
          if (typeof item.lastResolvedTester !== "undefined")
            setOps.lastResolvedTester = item.lastResolvedTester;
          if (typeof item.lastBugReport !== "undefined")
            setOps.lastBugReport = item.lastBugReport;
          if (typeof item.SOP !== "undefined") setOps.SOP = item.SOP;
          if (typeof item.ReleaseNotes !== "undefined")
            setOps.ReleaseNotes = item.ReleaseNotes;

          // Normalize incoming stack to an array of trimmed strings if provided
          let incomingStack: string[] | undefined;
          if (typeof item.stack !== "undefined") {
            incomingStack = Array.isArray(item.stack)
              ? item.stack.slice()
              : [item.stack];
            incomingStack = incomingStack
              .map((s) => (typeof s === "string" ? s.trim() : s))
              .filter(Boolean) as string[];
            incomingStack = Array.from(new Set(incomingStack)); // dedupe
          }

          if (existing) {
            // Build updateOps combining $set for non-stack fields and either $addToSet or $set for stack
            const existingStackRaw = Array.isArray(existing.stack)
              ? existing.stack
              : [];
            const existingStackNormalized = existingStackRaw
              .map((s: any) => (typeof s === "string" ? s.trim() : s))
              .filter(Boolean) as string[];

            // create a case-insensitive set for quick checking (lowercased)
            const existingSetLower = new Set(
              existingStackNormalized.map((s) => s.toLowerCase())
            );

            // Normalize incomingStack already computed earlier as `incomingStack`
            const incomingStackNormalized = Array.isArray(incomingStack)
              ? incomingStack
              : [];

            // For merge mode: only add items that are not already present (case-insensitive)
            let itemsToAdd: string[] = [];
            if (mergeStacksFlag && incomingStackNormalized.length) {
              itemsToAdd = incomingStackNormalized.filter(
                (s) => !existingSetLower.has(s.toLowerCase())
              );
            }

            // Build updateOps
            const updateOps: Record<string, any> = {};
            if (Object.keys(setOps).length) updateOps.$set = setOps;

            if (mergeStacksFlag) {
              if (itemsToAdd.length) {
                updateOps.$addToSet = { stack: { $each: itemsToAdd } };
              }
            } else {
              // replace mode: always set the stack to the incoming normalized array
              updateOps.$set = {
                ...(updateOps.$set || {}),
                stack: incomingStackNormalized,
              };
            }

            if (Object.keys(updateOps).length === 0) {
              // nothing to change
              results.push({ toolName, status: "skipped", tool: existing });
              continue;
            }

            const updatedDoc = await Tool.findOneAndUpdate(
              { toolName },
              updateOps,
              {
                new: true,
                runValidators: true,
              }
            ).lean();

            if (updatedDoc) existingMap.set(toolName, updatedDoc);
            results.push({ toolName, status: "updated", tool: updatedDoc });
          } else {
            // Create new tool payload (schema defaults will fill missing fields)
            const createPayload: any = { toolName };
            if (typeof item.toolDescription !== "undefined")
              createPayload.toolDescription = item.toolDescription;
            if (tester) createPayload.testerId = tester;
            if (dev) createPayload.devId = dev;
            if (typeof item.libraryName !== "undefined")
              createPayload.libraryName = item.libraryName;
            if (typeof item.htmlVersion !== "undefined")
              createPayload.htmlVersion = item.htmlVersion;
            if (typeof item.lastLibraryUpdate !== "undefined")
              createPayload.lastLibraryUpdate = item.lastLibraryUpdate;
            if (typeof item.lastHtmlUpdate !== "undefined")
              createPayload.lastHtmlUpdate = item.lastHtmlUpdate;
            if (typeof item.lastResolvedDev !== "undefined")
              createPayload.lastResolvedDev = item.lastResolvedDev;
            if (typeof item.lastResolvedTester !== "undefined")
              createPayload.lastResolvedTester = item.lastResolvedTester;
            if (typeof item.lastBugReport !== "undefined")
              createPayload.lastBugReport = item.lastBugReport;
            if (typeof item.SOP !== "undefined") createPayload.SOP = item.SOP;
            if (typeof item.ReleaseNotes !== "undefined")
              createPayload.ReleaseNotes = item.ReleaseNotes;
            if (incomingStack) createPayload.stack = incomingStack;

            const newDoc = new Tool(createPayload);
            const saved = await newDoc.save();

            existingMap.set(toolName, saved);
            results.push({ toolName, status: "created", tool: saved });
          }
        } catch (err: any) {
          if (err && err.code === 11000) {
            results.push({
              toolName,
              status: "error",
              error: "Duplicate key error",
              details: err.keyValue,
            });
          } else {
            results.push({
              toolName,
              status: "error",
              error: err?.message ?? err,
              details: err,
            });
          }
        }
      }

      // Build summary
      const summary = results.reduce(
        (acc, r) => {
          acc.total += 1;
          if (r.status === "created") acc.created += 1;
          if (r.status === "updated") acc.updated += 1;
          if (r.status === "error") acc.errors += 1;
          return acc;
        },
        { total: 0, created: 0, updated: 0, errors: 0 }
      );

      res.status(HttpStatusCodes.OK).json({
        message: "Batch tool operation completed",
        summary,
        results,
      });
    }
  );

  // Get Tool_list
  static GetTools = asyncHandler(
    async (_: Request, res: Response): Promise<void> => {
      try {
        const tools = await Tool.find();
        res.status(HttpStatusCodes.OK).json(tools);
      } catch (error) {
        res
          .status(HttpStatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error fetching tool_list", error });
      }
    }
  );
}
