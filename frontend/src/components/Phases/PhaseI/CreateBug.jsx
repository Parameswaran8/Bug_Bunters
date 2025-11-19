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
  const [bugForm_Visible, setBugForm_Visible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    // Add your save logic here
    console.log("Bug saved!");
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-2">
        <h3 className="text-2xl font-bold">Create Bug</h3>

        <div className="right_div flex gap-2">
          {/* New Bug Button */}
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            <BadgePlus className="mr-2 h-4 w-4" />
            New Bug
          </Button>
          <MenuOption />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <p className="text-gray-600">Create bug form will go here...</p>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-[96%] sm:!max-w-none sm:w-[550px] lg:w-[550px] overflow-y-auto rounded-xl sm:rounded-2xl border border-gray-300 ring-2 ring-gray-200 ring-offset-2 my-[3.2%] mx-[1.8%] sm:m-[1.2%] h-[97%]">
          <SheetHeader>
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bug Report</h3>
                <p className="text-[12px] sm:text-md text-gray-500">
                  Found a problem? Let us know so we can fix it.
                </p>
              </div>
            </div>
            <div className="hidden">
              <SheetTitle>
                <Bug className="w-6 h-6 text-white" /> Create New Bug
              </SheetTitle>
              <SheetDescription>
                Fill in the details below to report a new bug.
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Bug Form Component */}
          <BugForm />

          {/* Footer with Buttons */}
          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Bug</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateBug;
