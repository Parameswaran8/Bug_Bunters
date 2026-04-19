import React from "react";
import TableCreation from "./TableCreation";
import { Sheet } from "@/components/ui/sheet";
import AddUser from "./AddUser/Adduser";

function UserManagment({ searchQuery, isSheetOpen, setIsSheetOpen }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <TableCreation 
        isOpen={isSheetOpen} 
        setIsOpen={setIsSheetOpen} 
        searchQuery={searchQuery} 
      />
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <AddUser setIsOpen={setIsSheetOpen} />
      </Sheet>
    </div>
  );
}

export default UserManagment;
