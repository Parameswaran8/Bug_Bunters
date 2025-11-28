import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Calendar } from "lucide-react";
import { Button } from "../ui/button";

function AdminControl() {
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
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Form Section */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Birthday Date */}
          <div className="space-y-2">
            <Label
              htmlFor="birthDate"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Admin Control
            </Label>
            <div className="relative">
              <Input
                id="birthDate"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    birthDate: e.target.value,
                  })
                }
                className="bg-gray-50 border-gray-200 pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Booking Date */}
          <div className="space-y-2">
            <Label
              htmlFor="bookingDate"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Admin option
            </Label>
            <div className="relative">
              <Input
                id="bookingDate"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingDate: e.target.value,
                  })
                }
                className="bg-gray-50 border-gray-200 pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminControl;
