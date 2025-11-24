// BugForm.jsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asterisk, Upload, Bug, Menu, Loader2 } from "lucide-react";
import SearchableToolDropdown from "@/components/Dropdowns/SearchableSelect";
import DynamicSelect from "@/components/Dropdowns/Dropdown";
import Attachment from "./Attachment";
import AnimatedCheckbox from "./Checkbox";
import SOPChecklist from "./SopChecks";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

function BugForm({ setIsOpen }) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
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

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const sopList = [
    "Error is coming in multiple clients and is not client specific?",
    "I have updated to latest Script Version & still the error is coming?",
    "I have checked for multiple Triggers\\License issues?",
    "I have checked for any changes in Sheet made by client?",
  ];

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

  // Fetch tools and testers on mount
  useEffect(() => {
    loadTools();
    loadTesters();
  }, []);

  const loadTools = async () => {
    setIsLoadingTools(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockTools = [
        { id: "1", name: "CEOITBOX CRM", category: "Sales & Marketing" },
        {
          id: "2",
          name: "CEOITBOX Project Manager",
          category: "Project Management",
        },
        { id: "3", name: "CEOITBOX Analytics", category: "Analytics" },
        { id: "4", name: "CEOITBOX Chat", category: "Communication" },
        { id: "5", name: "CEOITBOX HR", category: "Human Resources" },
        { id: "6", name: "CEOITBOX Finance", category: "Finance" },
        {
          id: "7",
          name: "CEOITBOX Inventory",
          category: "Inventory Management",
        },
        { id: "8", name: "CEOITBOX Support", category: "Customer Support" },
      ];

      const formattedTools = mockTools.map((tool) => ({
        value: tool.id,
        label: tool.name,
        sublabel: tool.category,
      }));

      setTools(formattedTools);
    } catch (error) {
      console.error("Error loading tools:", error);
      setTools([]);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const loadTesters = async () => {
    setIsLoadingTesters(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockTesters = [
        { id: "t1", name: "John Doe", role: "Senior QA" },
        { id: "t2", name: "Jane Smith", role: "QA Engineer" },
        { id: "t3", name: "Mike Johnson", role: "Test Lead" },
        { id: "t4", name: "Sarah Williams", role: "QA Analyst" },
        { id: "t5", name: "David Brown", role: "Automation Tester" },
      ];

      const formattedTesters = mockTesters.map((tester) => ({
        value: tester.id,
        label: tester.name,
        sublabel: tester.role,
      }));

      setTesters(formattedTesters);
    } catch (error) {
      console.error("Error loading testers:", error);
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
    if (!sopChecks.some(Boolean)) {
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

    // Prepare complete data object for API
    const bugReportData = {
      tool: {
        id: selectedTool,
        name: tools.find((t) => t.value === selectedTool)?.label || "",
        category: tools.find((t) => t.value === selectedTool)?.sublabel || "",
      },
      tester: {
        id: selectedTester,
        name: testers.find((t) => t.value === selectedTester)?.label || "",
        role: testers.find((t) => t.value === selectedTester)?.sublabel || "",
      },
      priority: selectedPriority,
      descriptionType: descriptionType ? "simple" : "detailed",
      ...(descriptionType ? { description } : { expectedResult, actualResult }),

      facedBy: {
        me: facedByMe,
        client: facedByClient,
      },
      ...(facedByClient && {
        clientDetails: {
          clientName,
          companyName,
        },
      }),
      attachments: {
        image: selectedImage
          ? {
              name: selectedImage.name,
              size: selectedImage.size,
              type: selectedImage.type,
            }
          : null,
        video: selectedVideo
          ? {
              name: selectedVideo.name,
              size: selectedVideo.size,
              type: selectedVideo.type,
            }
          : null,
      },
      sopChecklist: sopData,
      submittedAt: new Date().toISOString(),
    };

    // Log to console
    console.log("✅ Bug Report Data Ready for API:");
    console.log(bugReportData);

    try {
      // Simulating API
      await sendBugReport(bugReportData);
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
    setSelectedImage(null);
    setSelectedVideo(null);
    // setDescriptionType(true);
    setFacedByMe(false);
    setFacedByClient(false);
    setParentChecked(false);
    setSopChecks([false, false, false, false]);

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

          {/* Upload Image and Video */}
          <Attachment
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedVideo={selectedVideo}
            setSelectedVideo={setSelectedVideo}
          />

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
