import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function Deployed() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Closure") : [];

  return (
    <div>
      <BugViewToggle title="Deployed Bugs" phaseBugs={phaseBugs} phaseId="deployed" />
    </div>
  );
}

export default Deployed;
