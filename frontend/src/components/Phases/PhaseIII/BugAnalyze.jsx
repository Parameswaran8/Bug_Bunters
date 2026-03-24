import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
function AnalyzeBug() {
  const { bugsList } = useAuth();
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Bug Analysis") : [];
  const standardBugs = phaseBugs.filter(bug => bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag !== "Red flag" && bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag !== "Go back to dev");
  const reanalysisBugs = phaseBugs.filter(bug => bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag === "Red flag" || bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag === "Go back to dev");

  return (
    <div className="flex flex-col gap-16 pb-10">
      <div>
        <BugViewToggle title="Analyze Bug" phaseBugs={standardBugs} phaseId="analyze" />
      </div>

      <div className="pt-6 border-t-2 border-red-100">
        <BugViewToggle title="Re-Analyse Bug" phaseBugs={reanalysisBugs} phaseId="reanalyze" />
      </div>
    </div>
  );
}

export default AnalyzeBug;
