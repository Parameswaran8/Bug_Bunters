import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function ReadyToTesting() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Ready to Test" || bug.currentPhase === "Maintenance") : [];

  return (
    <div>
      <BugViewToggle title="Ready for Testing" phaseBugs={phaseBugs} phaseId="rtt" />
    </div>
  );
}

export default ReadyToTesting;
