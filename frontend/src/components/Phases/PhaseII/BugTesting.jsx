import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForTester, getUserRoleFlags } from "@/utils/bugRoleFilter";

function BugTesting() {
  const { bugsList, user } = useAuth();

  const rawPhaseBugs = bugsList
    ? bugsList.filter(
        (bug) =>
          bug.currentPhase === "Bug Testing" ||
          bug.currentPhase === "Bug Confirmation"
      )
    : [];

  // Show only bugs assigned to this tester (admins see all)
  const phaseBugs = filterBugsForTester(rawPhaseBugs, user);

  const { isAdmin, isTester } = getUserRoleFlags(user);
  const editableColumnKeys = (isAdmin || isTester) 
    ? ["bugStatus", "sopFollowed", "remarks", "testingAttachment", "assignedDev", "currentPhase", "testingFlag", "delayedReason"]
    : ["currentPhase"];

  return (
    <div>
      <BugViewToggle 
        title="Bug Testing" 
        phaseBugs={phaseBugs} 
        phaseId="testing" 
        editableColumnKeys={editableColumnKeys}
      />
    </div>
  );
}

export default BugTesting;
