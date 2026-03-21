import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function BugTesting() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Bug Confirmation") : [];

  return (
    <div>
      <BugViewToggle title="Bug Testing" phaseBugs={phaseBugs} phaseId="testing" />
    </div>
  );
}

export default BugTesting;
