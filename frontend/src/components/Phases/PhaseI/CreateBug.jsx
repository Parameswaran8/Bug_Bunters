import React, { useState } from "react";
import { BadgePlus, Bug, Menu } from "lucide-react";
import MenuOption from "./MenuOption";
import BugForm from "./BugForm";
import BugViewToggle from "../Shared/BugViewToggle";
import { useAuth } from "@/context/AuthContext";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

function CreateBug() {
  const { bugsList } = useAuth();
  const [label, setLabel] = useState("personal");
  const [isOpen, setIsOpen] = useState(false);
  
  const phaseBugs = bugsList ? bugsList.filter(bug => bug.currentPhase === "Bug Reported") : [];

  return (
    <div>
      {/* Main Content */}
      <BugViewToggle 
        title="Create Bug"
        phaseBugs={phaseBugs} 
        phaseId="create"
        actionButton={
          <MenuOption
            onClick={() => setIsOpen(true)}
            title=" New Bug"
            icon={<BadgePlus className="h-4 w-4" />}
          />
        }
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <BugForm setIsOpen={setIsOpen} />
      </Sheet>
    </div>
  );
}

export default CreateBug;
