// BugForm.jsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asterisk, Upload, Bug, Menu, Loader2 } from "lucide-react";
import SearchableToolDropdown from "@/components/Dropdowns/SearchableSelect";
import DynamicSelect from "@/components/Dropdowns/Dropdown";
import AnimatedCheckbox from "./Checkbox";
import SOPChecklist from "./SopChecks";
import FileUploader from "../../Shared/FileUploader";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { createBug } from "@/API_Call/Bug";
import { useAuth } from "@/context/AuthContext";

function BugForm({ setIsOpen }) {
  const { toolList, allUsers, bugsList, setBugsList } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedTester, setSelectedTester] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [tools, setTools] = useState([]);
  const [testers, setTesters] = useState([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isLoadingTesters, setIsLoadingTesters] = useState(false);
  const [descriptionType, setDescriptionType] = useState(true);

  const [facedByMe, setFacedByMe] = useState(false);
  const [facedByClient, setFacedByClient] = useState(false);
  const [parentChecked, setParentChecked] = useState(false);

  const [sopChecks, setSopChecks] = useState([false, false, false, false]);
  const [attachments, setAttachments] = useState([]);

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const selectedToolData = tools.find(t => t.value === selectedTool);
  const sopList = selectedToolData?.sop ? selectedToolData.sop.split('\n').filter(s => s.trim() !== '') : [];

  useEffect(() => {
    setSopChecks(new Array(sopList.length || 0).fill(false));
    setParentChecked(false);
  }, [selectedTool, tools]);

  // Clear facedBy error when either checkbox is checked
  useEffect(() => {
    if (facedByMe || facedByClient) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.facedBy;
        return newErrors;
      });
    }
  }, [facedByMe, facedByClient]);

  // Clear SOP error when any checkbox is checked
  useEffect(() => {
    if (sopChecks.some(Boolean)) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sop;
        return newErrors;
      });
    }
  }, [sopChecks]);

  useEffect(() => {
    loadTesters();
  }, [allUsers, selectedTool, toolList]);

  // Sync Context tools to Dropdown format implicitly whenever context updates
  useEffect(() => {
    if (toolList && toolList.length > 0) {
      const formattedTools = toolList.map((tool) => ({
        value: tool.id || tool._id,
        label: tool.toolName,
        sublabel: tool.stack[0] || "No category",
        sop: tool.SOP || ""
      }));
      setTools(formattedTools);
    } else {
      setTools([]);
    }
  }, [toolList]);

    const loadTesters = async () => {
    setIsLoadingTesters(true);
    try {
      if (allUsers && allUsers.length > 0) {
        let defaultTesterId = null;
        if (selectedTool && toolList) {
          const matchedTool = toolList.find(t => (t.id || t._id) === selectedTool);
          if (matchedTool && matchedTool.testerId) {
             defaultTesterId = typeof matchedTool.testerId === "object" ? (matchedTool.testerId._id || matchedTool.testerId.id) : matchedTool.testerId;
          }
        }

        const actualTesters = allUsers
          .filter((u) => Array.isArray(u.roletype) ? u.roletype.includes("tester") : u.roletype === "tester")
          .map((tester) => ({
            value: tester.id,
            label: tester.id === defaultTesterId ? `${tester.name || tester.username || tester.email} (default)` : (tester.name || tester.username || tester.email),
          }));
          
        setTesters([
          ...actualTesters
        ]);
      } else {
        setTesters([]);
      }
    } catch (error) {
      setTesters([]);
    } finally {
      setIsLoadingTesters(false);
    }
  };

  const checkValidation = () => {
    let newErrors = {};
    let description = "";
    let expectedResult = "";
    let actualResult = "";
    let clientName = "";
    let companyName = "";

    if (!selectedTool) newErrors.tool = "Tool Name is required.";
    if (!selectedTester) newErrors.tester = "Tester is required.";
    if (!selectedPriority) newErrors.priority = "Priority is required.";

    if (descriptionType) {
      const desc = document.getElementById("description")?.value;
      if (!desc?.trim()) {
        newErrors.description = "Description is required.";
      } else {
        description = desc.trim();
      }
    } else {
      const expected = document.getElementById("expected_Result")?.value;
      const actual = document.getElementById("actual_Result")?.value;

      if (!expected?.trim()) {
        newErrors.expected = "Expected Result is required.";
      } else {
        expectedResult = expected.trim();
      }

      if (!actual?.trim()) {
        newErrors.actual = "Actual Result is required.";
      } else {
        actualResult = actual.trim();
      }
    }

    // Faced by validation
    if (!facedByMe && !facedByClient) {
      newErrors.facedBy = "Select who faced the issue.";
    }

    if (facedByClient) {
      const cname = document.getElementById("client_name")?.value;
      const comp = document.getElementById("company_name")?.value;

      if (!cname?.trim()) {
        newErrors.client_name = "Client Name is required.";
      } else {
        clientName = cname.trim();
      }

      if (!comp?.trim()) {
        newErrors.company_name = "Company Name is required.";
      } else {
        companyName = comp.trim();
      }
    }

    // SOP Check validation
    if (sopList.length > 0 && !sopChecks.some(Boolean)) {
      newErrors.sop = "SOP checklist items must be checked.";
    }

    setErrors(newErrors);
    return {
      newErrors,
      description,
      expectedResult,
      actualResult,
      clientName,
      companyName,
    };
  };

  const handleSubmit = async () => {
    const {
      newErrors,
      description,
      expectedResult,
      actualResult,
      clientName,
      companyName,
    } = checkValidation();

    if (Object.keys(newErrors).length > 0) {
      console.log("❌ Validation Failed:", newErrors);
      return; // stop submit
    }

    // START LOADING
    setIsSubmitting(true);

    // Prepare SOP data with questions
    const sopData = sopList.reduce((acc, question, index) => {
      acc[question] = sopChecks[index];
      return acc;
    }, {});

    const selectedItem = tools.find((t) => t.value === selectedTool);

    // Prepare complete data object for API formatted to match backend expectations
    const bugReportData = {
      toolInfo: {
        toolId: selectedTool,
        toolName: selectedItem?.label || "Unknown Tool",
        toolDescription: selectedItem?.sublabel || "Unknown Category",
        stack: selectedItem?.sublabel || "Unknown",
        priority: selectedPriority,
        
        // Map Description vs Expected/Actual cleanly for the backend
        bugDescription: descriptionType ? description : "Detailed Bug Report",
        expectedResult: descriptionType ? "Not Applicable (Simple Description)" : expectedResult,
        actualResult: descriptionType ? "Not Applicable (Simple Description)" : actualResult,
        
        attachments: attachments.map(f => ({
          url: f.url,
          fileName: f.name,
          size: f.size,
          uploadedAt: new Date()
        })),
      },
      tags: [],
      // Extra frontend context, ignored by the current backend schema but safe to pass
      clientContext: {
        facedByMe,
        facedByClient,
        clientName,
        companyName,
        sopChecklist: sopData,
      }
    };

    if (selectedTester && selectedTester !== "none") {
      bugReportData.assignedTester = { userId: selectedTester };
    }

    // Log to console
    console.log("✅ Bug Report Data Ready for API:");
    console.log(bugReportData);

    try {
      // API call execution
      const apiResponse = await createBug(bugReportData);
      
      // Real-time synchronization without refetch
      if (apiResponse.success && apiResponse.data && apiResponse.data.results) {
         const newBugs = apiResponse.data.results.filter(r => r.bug).map(r => r.bug);
         if (newBugs.length > 0) {
            setBugsList((prev) => [...prev, ...newBugs]);
         }
      }
      
      await new Promise((r) => setTimeout(r, 1500));

      // setIsOpen(false); // close sheet
    } catch (err) {
      console.error("API Submit Error:", err);
      toast.error(err.message || "Bug Report failed", {
        position: "top-center",
      });
    } finally {
      // STOP LOADING
      setIsSubmitting(false);
      toast.success("Bug Report successfully", {
        position: "top-center",
      });

      resetForm();
    }

    // console.log(JSON.stringify(bugReportData, null, 2));

    // // Also log just the SOP section for clarity
    // console.log("\n📋 SOP Checklist:");
    // console.log(sopData);

    // alert("Form Validated Successfully! Check console for data.");

    // Here you would make your API call:
    // try {
    //   const response = await fetch('/api/bugs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(bugReportData)
    //   });
    //   const result = await response.json();
    //   console.log('API Response:', result);
    // setIsOpen(false);
    // } catch (error) {
    //   console.error('API Error:', error);
    // }
  };

  const resetForm = () => {
    setErrors({});
    setSelectedTool("");
    setSelectedTester("");
    setSelectedPriority("");
    // setDescriptionType(true);
    setFacedByMe(false);
    setFacedByClient(false);
    setParentChecked(false);
    setSopChecks(new Array(sopList.length || 0).fill(false));
    setAttachments([]);

    // also clear input boxes manually
    const simpleDesc = document.getElementById("description");
    if (simpleDesc) simpleDesc.value = "";

    const expected = document.getElementById("expected_Result");
    if (expected) expected.value = "";

    const actual = document.getElementById("actual_Result");
    if (actual) actual.value = "";

    const cname = document.getElementById("client_name");
    if (cname) cname.value = "";

    const comp = document.getElementById("company_name");
    if (comp) comp.value = "";
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <SheetContent className="justify-between w-[96%] sm:!max-w-none sm:w-[550px] lg:w-[550px] overflow-y-auto rounded-xl sm:rounded-2xl border border-gray-300 ring-2 ring-gray-200 ring-offset-2 my-[3.2%] mx-[1.8%] sm:m-[1.2%] h-[97%]">
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
      <div className="flex flex-col justify-between h-[92%]">
        {/* bug form start here */}

        <div className="space-y-6 py-4">
          {/* Tool Name */}
          <div className="space-y-2">
            <Label
              htmlFor="tool"
              className="text-sm font-medium flex items-center"
            >
              <Asterisk size={12} />
              Tool Name
              <span className="block text-gray-500 text-xs">(Category)</span>
            </Label>

            <SearchableToolDropdown
              value={selectedTool}
              onChange={(val) => {
                setSelectedTool(val);
                if (errors.tool) setErrors((prev) => ({ ...prev, tool: "" }));
                
                // Auto-assign tester if configured on the tool
                const matchedTool = toolList?.find(t => (t.id || t._id) === val);
                if (matchedTool && matchedTool.testerId) {
                  const tId = typeof matchedTool.testerId === "object" 
                     ? (matchedTool.testerId._id || matchedTool.testerId.id) 
                     : matchedTool.testerId;
                  setSelectedTester(tId);
                  if (errors.tester) setErrors((prev) => ({ ...prev, tester: "" }));
                } else {
                  setSelectedTester("none");
                  if (errors.tester) setErrors((prev) => ({ ...prev, tester: "" }));
                }
              }}
              placeholder="Select a tool"
              items={tools}
              isLoading={isLoadingTools}
              classAdd={errors.tool ? "border-red-300" : ""}
            />
            {errors.tool && (
              <p className="text-red-400 text-xs">{errors.tool}</p>
            )}
          </div>

          {/* Assign Tester */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="tester"
                className="text-sm font-medium flex gap-0 items-center"
              >
                <Asterisk size={12} />
                Assign Tester
              </Label>

              <SearchableToolDropdown
                value={selectedTester}
                onChange={(val) => {
                  setSelectedTester(val);
                  if (errors.tester)
                    setErrors((prev) => ({ ...prev, tester: "" }));
                }}
                placeholder="Select tester"
                items={testers}
                isLoading={isLoadingTesters}
                classAdd={errors.tester ? "border-red-300" : ""}
              />
              {errors.tester && (
                <p className="text-red-400 text-xs">{errors.tester}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="flex text-sm font-medium items-center"
              >
                <Asterisk size={12} />
                Priority
              </Label>
              <DynamicSelect
                value={selectedPriority}
                onChange={(val) => {
                  setSelectedPriority(val);
                  if (errors.priority)
                    setErrors((prev) => ({ ...prev, priority: "" }));
                }}
                placeholder="Select priority"
                items={priorityOptions}
                className={`w-full border-2 !h-[40px] ${
                  errors.priority ? "border-red-300" : ""
                }`}
              />
              {errors.priority && (
                <p className="text-red-400 text-xs">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Bug Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="flex text-sm font-medium underline underline-offset-4 cursor-pointer items-center"
              onClick={() => setDescriptionType(!descriptionType)}
            >
              <Asterisk size={12} />
              {descriptionType ? "Description" : "Expected Result"}
            </Label>

            {descriptionType ? (
              <>
                <Textarea
                  id="description"
                  placeholder="Describe the issue you encountered. Include steps to reproduce, screen affected, and any error messages."
                  className={`text-sm border-2 rounded-lg ${
                    errors.description ? "border-red-300" : ""
                  }`}
                  rows={3}
                  onInput={() => {
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                />

                {errors.description && (
                  <p className="text-red-400 text-xs">{errors.description}</p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Textarea
                  id="expected_Result"
                  placeholder="Explain what should have happened. Example: The form should submit successfully and display a confirmation message."
                  rows={3}
                  className={`text-sm border-2 rounded-lg ${
                    errors.expected ? "border-red-300" : ""
                  }`}
                  onInput={() =>
                    setErrors((p) => ({ ...p, expected: "", actual: "" }))
                  }
                />
                {errors.expected && (
                  <p className="text-red-400 text-xs">{errors.expected}</p>
                )}

                <Label
                  htmlFor="actual_Result"
                  className="flex text-sm font-medium items-center"
                >
                  <Asterisk size={12} />
                  Actual Result
                </Label>

                <Textarea
                  id="actual_Result"
                  placeholder="Explain what actually happened. Example: Clicking submit reloads the page without saving data or showing any confirmation."
                  rows={3}
                  className={`text-sm border-2 rounded-lg ${
                    errors.actual ? "border-red-300" : ""
                  }`}
                  onInput={() =>
                    setErrors((p) => ({ ...p, expected: "", actual: "" }))
                  }
                />
                {errors.actual && (
                  <p className="text-red-500 text-xs">{errors.actual}</p>
                )}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="pt-2 pb-4 border-t border-gray-50 mt-4">
            <FileUploader 
              files={attachments} 
              onChange={setAttachments} 
              label="Bug Attachments" 
            />
          </div>

          {/* Faced By Section */}
          <div className="space-y-2">
            <div className="flex justify-between mr-[2rem]">
              <Label
                htmlFor="facedBy"
                className="flex text-sm font-medium items-center"
              >
                <Asterisk size={12} />
                Issue Faced By?
              </Label>

              <div className="flex gap-4">
                <AnimatedCheckbox
                  textSize=""
                  checkedVal={facedByMe}
                  setCheckedVal={setFacedByMe}
                  title="Me"
                />

                <AnimatedCheckbox
                  textSize=""
                  checkedVal={facedByClient}
                  setCheckedVal={setFacedByClient}
                  title="Client"
                />
              </div>
            </div>
            {errors.facedBy && (
              <p className="text-red-400 text-xs">{errors.facedBy}</p>
            )}
          </div>

          {facedByClient && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name" className="text-sm font-medium">
                  Client Name
                </Label>
                <Input
                  id="client_name"
                  type="text"
                  placeholder="Client Name"
                  className={`border-2 rounded-lg ${
                    errors.client_name ? "border-red-300" : ""
                  }`}
                  onInput={() => {
                    if (errors.client_name)
                      setErrors((prev) => ({ ...prev, client_name: "" }));
                  }}
                />

                {errors.client_name && (
                  <p className="text-red-400 text-xs">{errors.client_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder="Company Name"
                  className={`border-2 rounded-lg ${
                    errors.company_name ? "border-red-300" : ""
                  }`}
                  onInput={() => {
                    if (errors.company_name)
                      setErrors((prev) => ({ ...prev, company_name: "" }));
                  }}
                />
                {errors.company_name && (
                  <p className="text-red-400 text-xs">{errors.company_name}</p>
                )}
              </div>
            </div>
          )}

          <SOPChecklist
            checks={sopChecks}
            setChecks={setSopChecks}
            sopError={errors.sop}
            sopList={sopList}
            parentChecked={parentChecked}
            setParentChecked={setParentChecked}
          />
        </div>

        {/* bug form end here */}
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
                Submitting...
              </div>
            ) : (
              "Submit Bug"
            )}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

export default BugForm;
