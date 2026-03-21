// AddUser.jsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Asterisk,
  Upload,
  Bug,
  Menu,
  Loader2,
  UserRoundPlus,
} from "lucide-react";
import { register } from "@/API_Call/Auth";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

function AddUser({ setIsOpen }) {
  const { setAllUsers } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [full_name, setFull_name] = useState("");
  const [email_name, setEmail_name] = useState("");
  const [user_name, setUser_name] = useState("");

  // User role and admin option lists
  const roleOptions_ = ["Admin", "Developer", "Tester", "Viewer"]; //"Manager"
  const adminControlOptions = ["Create", "Edit", "Delete", "View"];
  const adminOptionsList = [
    "share",
    "generate_report",
    "insight_view",
    "export",
  ];

  // Selected multi-select state
  const [roles, setRoles] = useState([]);
  const [adminRights, setAdminRights] = useState([]);
  const [adminOptions, setAdminOptions] = useState([]);

  const checkValidation = () => {
    const newErrors = {};

    if (!full_name || !full_name.trim())
      newErrors.full_name = "Full Name is required.";

    if (!email_name || !email_name.trim())
      newErrors.email_name = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_name))
      newErrors.email_name = "Enter a valid email address.";

    if (!user_name || !user_name.trim())
      newErrors.user_name = "Username is required.";

    if (!roles || roles.length === 0)
      newErrors.roles = "Select at least one role.";

    setErrors(newErrors);
    return {
      newErrors,
    };
  };

  const handleSubmit = async () => {
    const { newErrors } = checkValidation();

    if (Object.keys(newErrors).length > 0) {
      console.log("❌ Validation Failed:", newErrors);
      return; // stop submit
    }

    // START LOADING
    setIsSubmitting(true);

    const userData = {
      name: full_name,
      email: email_name,
      username: user_name,
      password: "password123", // Default password for new users
      role: roles.includes("Admin") ? "admin" : "user",
      roletype: roles.includes("Developer") ? "dev" : roles.includes("Tester") ? "tester" : "bugreporter",
      adminControl: Array.isArray(adminRights) ? adminRights.map(v => v.toLowerCase()) : [],
      adminOption: Array.isArray(adminOptions)  ? adminOptions.map(v => v.toLowerCase()) : [],
    };

    try {
      const res = await register(userData);
      
      if (res.success && res.user) {
        // Map the backend DB structure locally
        const mappedUser = { ...res.user, id: res.user._id };
        
        // Push globally so table immediately updates without reloading DB
        setAllUsers(prev => [...prev, mappedUser]);

        toast.success("User created successfully", { position: "top-center" });
        resetForm();
        setIsOpen(false);
      } else {
         toast.error(res.message || "Create user failed", { position: "top-center" });
      }

    } catch (err) {
      console.error("API Submit Error:", err);
      toast.error(err.message || "Create user failed", {
        position: "top-center",
      });
    } finally {
      // STOP LOADING
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setErrors({});

    // reset user related fields
    setRoles([]);
    setAdminRights([]);
    setAdminOptions([]);

    setFull_name("");
    setEmail_name("");
    setUser_name("");
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <SheetContent className="justify-between w-[96%] sm:!max-w-none sm:w-[390px] lg:w-[390px] overflow-y-auto rounded-xl bg-white shadow-lg border border-gray-100 my-[3.2%] mx-[1.8%] sm:m-[1.2%] h-[97%] p-6">
      <SheetHeader>
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-200 rounded-lg flex items-center justify-center shadow-md">
            <UserRoundPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">Create New User</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Add user details and permissions below.
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
      <div className="flex flex-col gap-4 h-[92%]">
        {/* bug form start here */}

        <div className="space-y-6 py-4 rounded-md shadow-sm">
          {/* Tool Name */}
          <div className="space-y-2">
            <Label
              htmlFor="tool"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={12} />
              Full Name
            </Label>

            <Input
              id="full_name"
              type="text"
              placeholder="ex: John Doe"
              value={full_name}
              onChange={(e) => {
                setFull_name(e.target.value);
                if (errors.full_name) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.full_name;
                    return n;
                  });
                }
              }}
              className={`border-2 rounded-lg h-10 px-3 ${
                errors.full_name ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
            {errors.full_name && (
              <p className="text-red-400 text-xs">{errors.full_name}</p>
            )}
          </div>

          {/* Assign Tester */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="tester"
                className="text-sm font-medium flex gap-0 items-center"
              >
                <Asterisk size={12} />
                Email Address
              </Label>

              <Input
                id="email_name"
                type="email"
                placeholder="ex: your@email.com"
                value={email_name}
                onChange={(e) => {
                  setEmail_name(e.target.value);
                  if (errors.email_name) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.email_name;
                      return n;
                    });
                  }
                }}
                className={`border-2 rounded-lg h-10 px-3 ${
                  errors.email_name ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              />
              {errors.email_name && (
                <p className="text-red-400 text-xs">{errors.email_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="flex text-sm font-medium items-center"
              >
                <Asterisk size={12} />
                Username
              </Label>
              <Input
                id="user_name"
                type="text"
                placeholder="ex: param18"
                value={user_name}
                onChange={(e) => {
                  setUser_name(e.target.value);
                  if (errors.user_name) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.user_name;
                      return n;
                    });
                  }
                }}
                className={`border-2 rounded-lg h-10 px-3 ${
                  errors.user_name ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
              />
              {errors.user_name && (
                <p className="text-red-400 text-xs">{errors.user_name}</p>
              )}
            </div>
          </div>

          {/* Roles & Admin controls */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label
                htmlFor="priority"
                className="flex text-sm font-medium items-center"
              >
                <Asterisk size={12} />
                Roles
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-full mt-2 text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {roles.length > 0 ? roles.join(", ") : "Select Roles"}
                    </span>
                    {roles.length > 0 && (
                      <span className="ml-3 bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                        {roles.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {roleOptions_.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option}
                      checked={roles.includes(option)}
                      onClick={(e) => {
                        e.preventDefault();
                        setRoles((prev) =>
                          prev.includes(option)
                            ? prev.filter((r) => r !== option)
                            : [...prev, option]
                        );
                      }}
                    >
                      {option}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {errors.roles && (
                <p className="text-red-400 text-xs mt-1">{errors.roles}</p>
              )}
            </div>

            {roles.includes("Admin") && (
              <div>
                <Label className="text-sm font-medium">Admin Right</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full mt-2 text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {adminRights.length > 0
                          ? adminRights.join(", ")
                          : "Select Rights"}
                      </span>
                      {adminRights.length > 0 && (
                        <span className="ml-3 bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                          {adminRights.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {adminControlOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option}
                        checked={adminRights.includes(option)}
                        onClick={(e) => {
                          e.preventDefault();
                          setAdminRights((prev) =>
                            prev.includes(option)
                              ? prev.filter((r) => r !== option)
                              : [...prev, option]
                          );
                        }}
                      >
                        {option}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {roles.includes("Admin") && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm font-medium">Admin Option</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full mt-2 text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {adminOptions.length > 0
                          ? adminOptions.join(", ")
                          : "Select Options"}
                      </span>
                      {adminOptions.length > 0 && (
                        <span className="ml-3 bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                          {adminOptions.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {adminOptionsList.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option}
                        checked={adminOptions.includes(option)}
                        onClick={(e) => {
                          e.preventDefault();
                          setAdminOptions((prev) =>
                            prev.includes(option)
                              ? prev.filter((r) => r !== option)
                              : [...prev, option]
                          );
                        }}
                      >
                        {option}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
        {/* Add User end here */}
        <SheetFooter className="gap-3 py-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            // className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Adding User...
              </div>
            ) : (
              "Add User"
            )}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

export default AddUser;
