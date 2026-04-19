import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForDev, getUserRoleFlags } from "@/utils/bugRoleFilter";

function AnalyzeBug() {
  const { bugsList, user } = useAuth();

  const rawPhaseBugs = bugsList
    ? bugsList.filter((bug) => bug.currentPhase === "Bug Analysis")
    : [];

  // Show only bugs assigned to this developer (admins see all)
  const phaseBugs = filterBugsForDev(rawPhaseBugs, user);

  const isReanalysis = (bug) => {
    const flag = bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag;
    const hasBeenFixed = !!(bug.phaseIV_Maintenance?.fixedBy || bug.phaseIV_Maintenance?.maintenanceInfo?.status);
    return flag === "Go back to dev" || flag === "Red flag" || hasBeenFixed;
  };

  const standardBugs = phaseBugs.filter((bug) => !isReanalysis(bug));
  const reanalysisBugs = phaseBugs.filter((bug) => isReanalysis(bug));

  const { isAdmin, isDev } = getUserRoleFlags(user);
  const editableColumnKeys = (isAdmin || isDev)
    ? ["analyzeRemark", "sopForSolution", "delayedReason", "analyzeAttachment", "rootCause", "currentPhase"]
    : ["currentPhase"];

  return (
    <div className="flex flex-col gap-16 pb-10">
      <div>
        <BugViewToggle 
          title="Analyze Bug" 
          phaseBugs={standardBugs} 
          phaseId="analyze" 
          editableColumnKeys={editableColumnKeys}
        />
      </div>

      <div className="pt-6 border-t-2 border-red-100">
        <BugViewToggle 
          title="Re-Analyse Bug" 
          phaseBugs={reanalysisBugs} 
          phaseId="reanalyze" 
          editableColumnKeys={editableColumnKeys}
        />
      </div>
    </div>
  );
}

export default AnalyzeBug;
