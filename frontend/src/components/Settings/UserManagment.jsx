import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Calendar } from "lucide-react";
import TableCreation from "./TableCreation";

function UserManagment() {
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
    <TableCreation />
    // </div>
    // </div>
  );
}

export default UserManagment;
