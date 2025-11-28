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

function ToolManagment() {
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
      {/* Profile Section */}
      <div className="p-6 sm:p-8 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-gray-100">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emir"
                alt="Emir Abiyyu"
              />
              <AvatarFallback className="bg-yellow-500 text-white text-2xl font-semibold">
                EA
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900">
                Emir Abiyyu
              </h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                Admin <span>(Unique Id)</span>
              </p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Upload Now
          </Button>
        </div>
      </div>

      {/* Form Section */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Full Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="bg-gray-50 border-gray-200"
            />
          </div>
          {/* Company Name */}
          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              UserName
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  companyName: e.target.value,
                })
              }
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Owner User ID */}
          <div className="space-y-2">
            <Label
              htmlFor="ownerUserId"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Your Email
            </Label>
            <Input
              id="ownerUserId"
              value={formData.ownerUserId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ownerUserId: e.target.value,
                })
              }
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Role
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Department
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-gray-50 border-gray-200"
            />
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label
              htmlFor="group"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Phone no.
            </Label>
            <Select
              value={formData.group}
              onValueChange={(value) =>
                setFormData({ ...formData, group: value })
              }
            >
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP Leads">VIP Leads</SelectItem>
                <SelectItem value="Regular Leads">Regular Leads</SelectItem>
                <SelectItem value="Premium Leads">Premium Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Booking Date */}
          <div className="space-y-2">
            <Label
              htmlFor="bookingDate"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Your Roles
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

          {/* Booking Time */}
          <div className="space-y-2">
            <Label
              htmlFor="bookingTime"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Availble for online meeting/offline meeting
            </Label>
            <div className="relative">
              <Input
                id="bookingTime"
                value={formData.bookingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingTime: e.target.value,
                  })
                }
                className="bg-gray-50 border-gray-200 pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="bookingTime"
              className="text-xs text-gray-500 uppercase font-medium"
            >
              Select Language
            </Label>
            <div className="relative">
              <Input
                id="bookingTime"
                value={formData.bookingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bookingTime: e.target.value,
                  })
                }
                className="bg-gray-50 border-gray-200 pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/*  */}
        </div>
      </div>
    </div>
  );
}

export default ToolManagment;
