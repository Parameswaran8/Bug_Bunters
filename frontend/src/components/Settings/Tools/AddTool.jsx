import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Asterisk, DraftingCompass, Loader2 } from "lucide-react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { updateTool } from "@/API_Call/Tool";
import { useAuth } from "@/context/AuthContext";

function AddTool({ setIsOpen, onToolAdded }) {
  const { stackList, setToolList, allUsers } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tool Schema States
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [libraryName, setLibraryName] = useState("");
  const [htmlVersion, setHtmlVersion] = useState("");
  const [selectedStacks, setSelectedStacks] = useState([]);
  const [testerId, setTesterId] = useState("");
  const [devId, setDevId] = useState("");
  const [SOP, setSOP] = useState("");
  const [ReleaseNotes, setReleaseNotes] = useState("");

  const checkValidation = () => {
    const newErrors = {};

    if (!toolName || !toolName.trim()) {
      newErrors.toolName = "Tool Name is required.";
    }

    setErrors(newErrors);
    return { newErrors };
  };

  const handleSubmit = async () => {
    const { newErrors } = checkValidation();

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const toolData = {
      toolName,
      toolDescription,
      libraryName,
      htmlVersion,
      stack: selectedStacks,
      testerId,
      devId,
      SOP,
      ReleaseNotes,
    };

    try {
      const response = await updateTool(toolData);
      
      if (response.success) {
        toast.success("Tool added successfully", { position: "top-center" });
        if (onToolAdded) onToolAdded();
        
        // Push globally so table immediately updates without reloading DB
        if (response.data?.tools?.length > 0) {
           const newToolBackend = response.data.tools[0];
           const mappedTool = { ...newToolBackend, id: newToolBackend._id };
           setToolList(prev => [mappedTool, ...prev]);
        }

        resetForm();
        setIsOpen(false);
      } else {
        toast.error(response.message || "Failed to create tool");
      }
    } catch (err) {
      console.error("API Submit Error:", err);
      toast.error(err.message || "Failed to create tool", { position: "top-center" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setErrors({});
    setToolName("");
    setToolDescription("");
    setLibraryName("");
    setHtmlVersion("");
    setSelectedStacks([]);
    setTesterId("");
    setDevId("");
    setSOP("");
    setReleaseNotes("");
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <SheetContent className="justify-between w-[96%] sm:!max-w-none sm:w-[500px] lg:w-[500px] overflow-y-auto rounded-xl bg-white shadow-lg border border-gray-100 my-[3.2%] mx-[1.8%] sm:m-[1.2%] h-[97%] p-6">
      <SheetHeader>
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-200 rounded-lg flex items-center justify-center shadow-md">
            <DraftingCompass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-xl">Create New Tool</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Add tool details and specs below.
            </p>
          </div>
        </div>
        <div className="hidden">
          <SheetTitle>Create New Tool</SheetTitle>
          <SheetDescription>Form to add a tool</SheetDescription>
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-4 h-[92%]">
        <div className="space-y-6 py-4 rounded-md shadow-sm">
          {/* Tool Name */}
          <div className="space-y-2">
            <Label htmlFor="toolName" className="text-sm font-medium flex items-center">
              <Asterisk size={12} className="text-red-500" />
              Tool Name
            </Label>
            <Input
              id="toolName"
              type="text"
              placeholder="e.g. Sales CRM"
              value={toolName}
              onChange={(e) => {
                setToolName(e.target.value);
                if (errors.toolName) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.toolName;
                    return n;
                  });
                }
              }}
              className={`border-2 rounded-lg h-10 px-3 ${
                errors.toolName ? "border-red-300" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-200`}
            />
            {errors.toolName && (
              <p className="text-red-400 text-xs">{errors.toolName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="toolDescription" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="toolDescription"
              placeholder="Brief description of the tool"
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              className="text-sm border-2 rounded-lg border-gray-200"
              rows={2}
            />
          </div>

          {/* Library & HTML Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="libraryName" className="text-sm font-medium">
                Library Version
              </Label>
              <Input
                id="libraryName"
                placeholder="e.g. React 18.2"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="border-2 rounded-lg h-10 px-3 border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="htmlVersion" className="text-sm font-medium">
                HTML Version
              </Label>
              <Input
                id="htmlVersion"
                placeholder="e.g. HTML5"
                value={htmlVersion}
                onChange={(e) => setHtmlVersion(e.target.value)}
                className="border-2 rounded-lg h-10 px-3 border-gray-200"
              />
            </div>
          </div>

          {/* Stack */}
          <div className="space-y-2">
            <Label htmlFor="stack" className="text-sm font-medium">
              Tech Stack
            </Label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedStacks.map((stackName) => (
                <div key={stackName} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md border border-blue-200">
                  <span>{stackName}</span>
                  <button 
                    onClick={() => setSelectedStacks(prev => prev.filter(s => s !== stackName))}
                    className="text-blue-500 hover:text-blue-800 ml-1 rounded-full p-0.5 focus:outline-none"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <select
              id="stack"
              className="w-full border-2 rounded-lg h-10 px-3 border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedStacks.includes(val)) {
                   setSelectedStacks([...selectedStacks, val]);
                }
                e.target.value = ""; // reset after pick
              }}
              defaultValue=""
            >
              <option value="" disabled>Select a tech stack to add...</option>
              {stackList && stackList.map(stackOpt => (
                 <option key={stackOpt} value={stackOpt}>{stackOpt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="testerId" className="text-sm font-medium">
                Responsible Tester
              </Label>
              <select
                id="testerId"
                value={testerId}
                onChange={(e) => setTesterId(e.target.value)}
                className="w-full border-2 rounded-lg h-10 px-3 border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">None Assigned</option>
                {allUsers && allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.username || u.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="devId" className="text-sm font-medium">
                Responsible Dev
              </Label>
              <select
                id="devId"
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                className="w-full border-2 rounded-lg h-10 px-3 border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">None Assigned</option>
                {allUsers && allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.username || u.email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SOP */}
          <div className="space-y-2">
            <Label htmlFor="sop" className="text-sm font-medium">
              SOP Document Link / Text
            </Label>
            <Textarea
              id="sop"
              placeholder="SOP guidelines"
              value={SOP}
              onChange={(e) => setSOP(e.target.value)}
              className="text-sm border-2 rounded-lg border-gray-200"
              rows={2}
            />
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <Label htmlFor="releaseNotes" className="text-sm font-medium">
              Release Notes
            </Label>
            <Textarea
              id="releaseNotes"
              placeholder="Latest release details"
              value={ReleaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="text-sm border-2 rounded-lg border-gray-200"
              rows={2}
            />
          </div>
        </div>

        <SheetFooter className="gap-3 py-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Adding Tool...
              </div>
            ) : (
              "Add Tool"
            )}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

export default AddTool;
