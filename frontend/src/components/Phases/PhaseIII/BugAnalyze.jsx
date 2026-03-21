import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function AnalyzeBug() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Bug Analysis") : [];

  return (
    <div>
      <BugViewToggle title="Analyze Bug" phaseBugs={phaseBugs} phaseId="analyze" />
    </div>
  );
}

export default AnalyzeBug;
