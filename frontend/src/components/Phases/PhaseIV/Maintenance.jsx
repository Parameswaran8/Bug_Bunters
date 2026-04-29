import React from "react";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForDev, getUserRoleFlags } from "@/utils/bugRoleFilter";

function Maintenance() {
  const { bugsList, user } = useAuth();

  const rawPhaseBugs = bugsList
    ? bugsList.filter((bug) => bug.currentPhase === "Maintenance")
    : [];

  // Maintenance is typically handled by Developers
  const phaseBugs = filterBugsForDev(rawPhaseBugs, user);

  const { isAdmin, isDev } = getUserRoleFlags(user);
  const editableColumnKeys = (isAdmin || isDev)
    ? ["finalTestingRemark", "testingFlag", "currentPhase"]
    : ["currentPhase"];

  return (
    <div className="flex flex-col gap-16 pb-10">
      <div>
        <BugViewToggle 
          title="Maintenance" 
          phaseBugs={phaseBugs} 
          phaseId="maintenance" 
          editableColumnKeys={editableColumnKeys}
        />
      </div>
    </div>
  );
}

export default Maintenance;
