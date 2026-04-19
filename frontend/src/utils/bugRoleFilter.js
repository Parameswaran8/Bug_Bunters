/**
 * Shared role-based bug filtering utilities.
 *
 * Bug actor IDs can be stored as:
 *   - a plain string ID
 *   - an object { _id, name, ... }
 * This helper extracts the raw string ID from either form.
 */
function extractId(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  return val._id || val.id || null;
}

/**
 * Parse role flags from the logged-in user object.
 */
export function getUserRoleFlags(user) {
  if (!user) return { isAdmin: false, isBugRaiser: false, isTester: false, isDev: false };
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const roleArr = Array.isArray(user.roletype)
    ? user.roletype
    : user.roletype
    ? [user.roletype]
    : [];
  return {
    isAdmin,
    isBugRaiser: roleArr.includes("bugreporter"),
    isTester: roleArr.includes("tester"),
    isDev: roleArr.includes("dev"),
  };
}

/**
 * Returns the current user's string ID (tries _id then id).
 */
export function getUserId(user) {
  if (!user) return null;
  return user._id || user.id || null;
}

/**
 * Returns true if the given bug was raised by userId.
 */
export function isBugRaisedBy(bug, userId) {
  const reportedBy = bug.phaseI_BugReport?.reportedBy;
  return extractId(reportedBy) === userId;
}

/**
 * Returns true if the given bug has userId assigned as tester.
 */
export function isBugAssignedToTester(bug, userId) {
  const tester = bug.phaseI_BugReport?.assignedTester;
  return extractId(tester) === userId;
}

/**
 * Returns true if the given bug has userId assigned as developer.
 */
export function isBugAssignedToDev(bug, userId) {
  const dev = bug.phaseII_BugConfirmation?.assignedDeveloper;
  return extractId(dev) === userId;
}

/**
 * Returns true if the user is involved in the bug in any capacity
 * (raiser, tester, or developer). Always true for admins.
 */
export function isUserInvolvedInBug(bug, user) {
  const { isAdmin } = getUserRoleFlags(user);
  if (isAdmin) return true;
  const uid = getUserId(user);
  if (!uid) return false;
  return (
    isBugRaisedBy(bug, uid) ||
    isBugAssignedToTester(bug, uid) ||
    isBugAssignedToDev(bug, uid)
  );
}

/**
 * Filters a bug list to only bugs the user can SEE in the New Bug tab
 * (bugs they personally raised).
 * Admins see all.
 */
export function filterBugsForRaiser(bugs, user) {
  const { isAdmin } = getUserRoleFlags(user);
  if (isAdmin) return bugs;
  const uid = getUserId(user);
  if (!uid) return [];
  // Show bugs user raised OR bugs user is assigned to as tester
  return bugs.filter((b) => isBugRaisedBy(b, uid) || isBugAssignedToTester(b, uid));
}

/**
 * Filters a bug list to only bugs assigned to the logged-in tester.
 * Admins see all.
 */
export function filterBugsForTester(bugs, user) {
  const { isAdmin } = getUserRoleFlags(user);
  if (isAdmin) return bugs;
  const uid = getUserId(user);
  if (!uid) return [];
  return bugs.filter((b) => isBugAssignedToTester(b, uid));
}

/**
 * Filters a bug list to only bugs assigned to the logged-in developer.
 * Admins see all.
 */
export function filterBugsForDev(bugs, user) {
  const { isAdmin } = getUserRoleFlags(user);
  if (isAdmin) return bugs;
  const uid = getUserId(user);
  if (!uid) return [];
  return bugs.filter((b) => isBugAssignedToDev(b, uid));
}
