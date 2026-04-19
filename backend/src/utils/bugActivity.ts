import LogModel from "../models/logs.models";
import { Types } from "mongoose";

/**
 * Logs an activity for a bug.
 */
export async function logBugActivity(
  bugId: Types.ObjectId | string,
  performedBy: Types.ObjectId | string | undefined,
  action: string,
  details: string,
  type: string = "bug_activity"
) {
  try {
    await LogModel.create({
      bugId,
      performedBy,
      action,
      details,
      type,
    });
  } catch (error) {
    console.error("Error logging bug activity:", error);
  }
}

/**
 * Compares two bug objects and returns a list of changes.
 * This is a simplified deep comparison.
 */
export function captureBugChanges(oldData: any, newData: any, prefix: string = ""): any[] {
  const changes: any[] = [];
  
  // Fields to ignore (metadata, internal mongoose fields)
  const ignoreFields = ["_id", "__v", "updatedAt", "createdAt", "bugId", "reportedAt", "testedAt", "analyzedAt", "fixedAt", "approvedAt", "deployedAt", "closedAt"];

  // Normalize data (convert mongoose documents to plain objects if needed)
  const oldObj = oldData && typeof oldData.toObject === 'function' ? oldData.toObject() : oldData;
  const newObj = newData && typeof newData.toObject === 'function' ? newData.toObject() : newData;

  for (const key in newObj) {
    if (ignoreFields.includes(key)) continue;

    const oldVal = oldObj ? oldObj[key] : undefined;
    const newVal = newObj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Skip if both are empty/null/undefined
    if (!oldVal && !newVal && oldVal !== false && newVal !== false && oldVal !== 0 && newVal !== 0) continue;

    if (newVal && typeof newVal === 'object' && !(newVal instanceof Date) && !(newVal instanceof Types.ObjectId) && !Array.isArray(newVal)) {
      // Recurse for nested objects
      const nestedChanges = captureBugChanges(oldVal || {}, newVal, fullKey);
      changes.push(...nestedChanges);
    } else {
      // Comparison for primitives, arrays, Dates, ObjectIds
      let isDifferent = false;

      if (Array.isArray(newVal)) {
        isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);
      } else if (newVal instanceof Date || oldVal instanceof Date) {
        isDifferent = new Date(oldVal).getTime() !== new Date(newVal).getTime();
      } else if (newVal instanceof Types.ObjectId || oldVal instanceof Types.ObjectId) {
        isDifferent = oldVal?.toString() !== newVal?.toString();
      } else {
        isDifferent = oldVal !== newVal;
      }

      if (isDifferent) {
        changes.push({ 
          field: fullKey, 
          oldValue: oldVal, 
          newValue: newVal 
        });
      }
    }
  }

  return changes;
}
