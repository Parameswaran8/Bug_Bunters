import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgePlus, Bug, Menu } from "lucide-react";
import MenuOption from "./MenuOption";
import BugForm from "./BugForm";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

function CreateBug() {
  const [label, setLabel] = useState("personal");
  // const [bugForm_Visible, setBugForm_Visible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <h3 className="text-2xl font-bold">Create Bug</h3>

        <div className="right_div flex gap-2">
          <MenuOption
            onClick={() => setIsOpen(true)}
            title=" New Bug"
            icon={<BadgePlus className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <p className="text-gray-600">Create bug form will go here...</p>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <BugForm setIsOpen={setIsOpen} />
      </Sheet>
    </div>
  );
}

export default CreateBug;
