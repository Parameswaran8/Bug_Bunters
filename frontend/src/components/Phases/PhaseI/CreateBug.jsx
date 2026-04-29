import React, { useState } from "react";
import { BadgePlus } from "lucide-react";
import MenuOption from "./MenuOption";
import BugForm from "./BugForm";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";
import { filterBugsForRaiser, getUserRoleFlags } from "@/utils/bugRoleFilter";
import { Sheet } from "@/components/ui/sheet";

function CreateBug() {
  const { bugsList, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { isAdmin, isBugRaiser } = getUserRoleFlags(user);
  const canCreate = isAdmin || isBugRaiser;

  const editableColumnKeys = (isAdmin || isBugRaiser)
    ? ["toolName", "priority", "stack", "description", "assignedTester", "attachments"]
    : ["currentPhase"];

  const rawPhaseBugs = bugsList
    ? bugsList.filter((bug) => bug.currentPhase === "Bug Reported")
    : [];

  // Show only bugs this user raised (admins see all)
  const phaseBugs = filterBugsForRaiser(rawPhaseBugs, user);

  return (
    <div>
      <BugViewToggle
        title="Create Bug"
        phaseBugs={phaseBugs}
        phaseId="create"
        editableColumnKeys={editableColumnKeys}
        actionButton={
          canCreate ? (
            <MenuOption
              onClick={() => setIsOpen(true)}
              title=" New Bug"
              icon={<BadgePlus className="h-4 w-4" />}
            />
          ) : null
        }
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <BugForm setIsOpen={setIsOpen} />
      </Sheet>
    </div>
  );
}

export default CreateBug;
