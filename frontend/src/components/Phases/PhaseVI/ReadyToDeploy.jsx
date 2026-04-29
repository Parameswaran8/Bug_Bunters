import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForDev } from "@/utils/bugRoleFilter";

function ReadyToDeploy() {
  const { bugsList, user } = useAuth();

  const rawPhaseBugs = bugsList
    ? bugsList.filter(
        (bug) =>
          bug.currentPhase === "Ready to Deploy" ||
          bug.currentPhase === "Final Testing"
      )
    : [];

  // Show only bugs assigned to this developer (admins see all)
  const phaseBugs = filterBugsForDev(rawPhaseBugs, user);

  return (
    <div>
      <BugViewToggle title="Ready for Deployment" phaseBugs={phaseBugs} phaseId="rtd" />
    </div>
  );
}

export default ReadyToDeploy;
