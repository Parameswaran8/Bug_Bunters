import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function ReadyToDeploy() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Ready to Deploy" || bug.currentPhase === "Final Testing") : [];

  return (
    <div>
      <BugViewToggle title="Ready for Deployment" phaseBugs={phaseBugs} phaseId="rtd" />
    </div>
  );
}

export default ReadyToDeploy;
