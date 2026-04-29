import React, { useState } from "react";
import BugViewToggle from "./BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, BadgePlus } from "lucide-react";
import { isUserInvolvedInBug, getUserRoleFlags } from "@/utils/bugRoleFilter";
import BugForm from "../PhaseI/BugForm";
import { Sheet } from "@/components/ui/sheet";


function getEditableColumnKeys(user) {
  if (!user) return [];
  if (user.role === "admin" || user.role === "superadmin") return null; // null = all editable

  const roleArr = Array.isArray(user.roletype) ? user.roletype : (user.roletype ? [user.roletype] : []);
  const isBugRaiser = roleArr.includes("bugreporter");
  const isTester    = roleArr.includes("tester");
  const isDev       = roleArr.includes("dev");

  const editable = new Set();

  if (isBugRaiser) {
    ["toolName", "priority", "stack", "issueFacedBy", "description", "sopFollowedRaiser", "assignedTester", "attachments", "currentPhase"]
      .forEach(k => editable.add(k));
  }
  if (isTester) {
    ["bugStatus", "sopFollowed", "remarks", "testingAttachment", "assignedDev", "delayedReason", "currentPhase", "testingFlag"]
      .forEach(k => editable.add(k));
  }
  if (isDev) {
    ["analyzeRemark", "sopForSolution", "delayedReason", "analyzeAttachment", "testingFlag", "finalTestingRemark",
     "deploymentStatus", "deployRemark", "finalSop", "bugStatus", "currentPhase"]
      .forEach(k => editable.add(k));
  }

  // bugId, bugRaiser, reportedDate, rootCause are always read-only
  return [...editable];
}

export default function AllBugsStage() {
  const { bugsList, user } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState("All Phases");
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { isAdmin, isBugRaiser } = getUserRoleFlags(user);
  const canCreate = isAdmin || isBugRaiser;

  const editableColumnKeys = getEditableColumnKeys(user);

  // Row-level edit gate: user can only edit rows they are involved in.
  // Admins (editableColumnKeys === null) can edit any row.
  const canEditRow = editableColumnKeys === null
    ? null  // null signals BugTable: all rows editable
    : (bug) => isUserInvolvedInBug(bug, user);

  const filterOptions = [
    "All Phases",
    "Bug Reported",
    "Bug Testing",
    "Bug Analysis",
    "Ready to Test",
    "Ready to Deploy",
    "Closure"
  ];

  let filteredBugs = bugsList || [];
  if (selectedPhase !== "All Phases") {
    filteredBugs = filteredBugs.filter(bug => {
      if (selectedPhase === "Ready to Test")   return bug.currentPhase === "Ready to Test"   || bug.currentPhase === "Maintenance";
      if (selectedPhase === "Ready to Deploy") return bug.currentPhase === "Ready to Deploy" || bug.currentPhase === "Final Testing";
      if (selectedPhase === "Bug Testing")     return bug.currentPhase === "Bug Testing"     || bug.currentPhase === "Bug Confirmation";
      return bug.currentPhase === selectedPhase;
    });
  }

  return (
    <div className="w-full">
      <BugViewToggle 
        title="All Bugs"
        phaseBugs={filteredBugs} 
        phaseId={showFullDetails ? "all_full" : "all"}
        editableColumnKeys={editableColumnKeys}
        canEditRow={canEditRow}
        actionButton={
          <div className="flex items-center gap-3">
            <Button 
               variant={showFullDetails ? "default" : "outline"}
               className="h-9 px-3 text-sm shadow-sm transition-all focus:ring-0"
               onClick={() => setShowFullDetails(!showFullDetails)}
            >
               {showFullDetails ? "Compact View" : "Full Details"}
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 h-9 px-3 border-gray-200 shadow-sm transition-all hover:bg-gray-50 focus:ring-0">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{selectedPhase}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[100] shadow-lg border-gray-100 rounded-xl">
              {filterOptions.map(opt => (
                <DropdownMenuItem 
                   key={opt}
                   onClick={() => setSelectedPhase(opt)}
                   className={`cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2 text-sm ${selectedPhase === opt ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                >
                   {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {canCreate && (
             <Button 
               onClick={() => setIsCreateOpen(true)}
               className="h-9 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 group"
             >
               <BadgePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
               <span className="hidden sm:inline">New Bug</span>
             </Button>
          )}
          </div>
        }
      />

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <BugForm setIsOpen={setIsCreateOpen} />
      </Sheet>
    </div>
  );
}
