import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForTester } from "@/utils/bugRoleFilter";

function ReadyToTesting() {
  const { bugsList, user } = useAuth();

  const rawPhaseBugs = bugsList
    ? bugsList.filter(
        (bug) =>
          bug.currentPhase === "Ready to Test"
      )
    : [];

  // Show only bugs assigned to this tester (admins see all)
  const phaseBugs = filterBugsForTester(rawPhaseBugs, user);

  return (
    <div>
      <BugViewToggle title="Ready for Testing" phaseBugs={phaseBugs} phaseId="rtt" />
    </div>
  );
}

export default ReadyToTesting;
