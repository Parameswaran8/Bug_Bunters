import React from "react";
import { Sheet } from "@/components/ui/sheet";
import TableTool from "./TableTool";
import AddTool from "./AddTool";

function ToolManagment({ isOpen, setIsOpen }) {
  return (
    <div>
      <TableTool isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <AddTool setIsOpen={setIsOpen} onToolAdded={() => {}} />
      </Sheet>
    </div>
  );
}

export default ToolManagment;
