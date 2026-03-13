import React, { useState } from "react";
import TableCreation from "./TableCreation";

import { Sheet } from "@/components/ui/sheet";
import AddUser from "./AddUser/Adduser";

function UserManagment() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Emir",
    lastName: "Abiyyu",
    companyName: "SpineEdge",
    ownerUserId: "SpineEdge",
    email: "helloemir@gmail.com",
    phone: "(603) 555-0123",
    group: "VIP Leads",
    birthDate: "23/05/1992",
    bookingDate: "18/08/2024",
    bookingTime: "10:45 am",
    buyRent: "To Buy",
    properties: "Apartment",
    country: "",
    city: "",
  });

  return (
    // <div className="bg-white rounded-xl border border-gray-200">
    // <div className="p-6 sm:p-8">
    <div>
      <TableCreation isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <AddUser setIsOpen={setIsOpen} />
      </Sheet>
    </div>
    // </div>
  );
}

export default UserManagment;
