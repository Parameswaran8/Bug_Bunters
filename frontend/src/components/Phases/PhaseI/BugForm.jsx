// BugForm.jsx
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Asterisk, Upload } from "lucide-react";
import SearchableToolDropdown from "@/components/Dropdowns/SearchableSelect";
import DynamicSelect from "@/components/Dropdowns/Dropdown";
import { Button } from "@/components/ui/button";
import Attachment from "./Attachment";

function BugForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedTester, setSelectedTester] = useState(""); // Fixed typo
  const [selectedPriority, setSelectedPriority] = useState(""); // Added state for priority
  const [tools, setTools] = useState([]);
  const [testers, setTesters] = useState([]); // Fixed typo
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [isLoadingTesters, setIsLoadingTesters] = useState(false);
  const [DescriptType, setDescriptType] = useState(false);

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedImage(file);
  //   }
  // };

  // const handleVideoUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedVideo(file);
  //   }
  // };

  // const removeImage = () => {
  //   setSelectedImage(null);
  // };

  // const removeVideo = () => {
  //   setSelectedVideo(null);
  // };

  // Fetch tools and testers on mount
  useEffect(() => {
    loadTools();
    loadTesters();
  }, []);

  const loadTools = async () => {
    setIsLoadingTools(true);
    try {
      // Replace this with your real API call
      // const response = await fetch("/api/tools");
      // const data = await response.json();

      // TEMPORARY: Mock data for testing
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

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

      // Format data to match expected structure
      const formattedTools = mockTools.map((tool) => ({
        value: tool.id,
        label: tool.name,
        sublabel: tool.category,
      }));

      setTools(formattedTools);
    } catch (error) {
      console.error("Error loading tools:", error);
      setTools([]); // Set empty array on error
    } finally {
      setIsLoadingTools(false);
    }
  };

  const loadTesters = async () => {
    setIsLoadingTesters(true);
    try {
      // Replace this with your real API call
      // const response = await fetch("/api/testers");
      // const data = await response.json();

      // TEMPORARY: Mock data for testing
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      const mockTesters = [
        { id: "t1", name: "John Doe", role: "Senior QA" },
        { id: "t2", name: "Jane Smith", role: "QA Engineer" },
        { id: "t3", name: "Mike Johnson", role: "Test Lead" },
        { id: "t4", name: "Sarah Williams", role: "QA Analyst" },
        { id: "t5", name: "David Brown", role: "Automation Tester" },
      ];

      // Format data to match expected structure
      const formattedTesters = mockTesters.map((tester) => ({
        value: tester.id,
        label: tester.name,
        sublabel: tester.role,
      }));

      setTesters(formattedTesters);
    } catch (error) {
      console.error("Error loading testers:", error);
      setTesters([]); // Set empty array on error
    } finally {
      setIsLoadingTesters(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Tool Name */}
      <div className="space-y-2">
        <Label
          htmlFor="tool"
          className="text-sm font-medium flex  items-center"
        >
          <Asterisk size={12} />
          Tool Name
          <span className="block text-gray-500 text-xs">(Category)</span>
        </Label>

        <SearchableToolDropdown
          value={selectedTool}
          onChange={setSelectedTool}
          placeholder="Select a tool"
          items={tools}
          isLoading={isLoadingTools}
        />
      </div>

      {/* Assign Tester */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="tester"
            className="text-sm font-medium flex gap-2 items-center"
          >
            Assign Tester
          </Label>

          <SearchableToolDropdown
            value={selectedTester}
            onChange={setSelectedTester}
            placeholder="Select a tester"
            items={testers}
            isLoading={isLoadingTesters}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-sm font-medium">
            Priority
          </Label>
          <DynamicSelect
            value={selectedPriority}
            onChange={setSelectedPriority}
            placeholder="Select priority"
            items={priorityOptions}
            // groupLabel="Priority Levels"
            className="w-full border-2"
          />
        </div>
      </div>

      {/* Bug Description */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium underline underline-offset-4 cursor-pointer"
          onClick={() => setDescriptType(!DescriptType)}
        >
          {DescriptType ? "Description" : "Expected Result"}
        </Label>

        {DescriptType ? (
          <Textarea
            id="description"
            placeholder="Describe the issue you encountered. Include steps to reproduce, screen affected, and any error messages."
            rows={4}
            className="text-sm border-2 focus:border-primary rounded-lg "
          />
        ) : (
          <div className="flex flex-col gap-2">
            <Textarea
              id="expected_Result"
              placeholder="Explain what should have happened. Example: The form should submit successfully and display a confirmation message."
              rows={4}
              className="text-sm border-2 focus:border-primary rounded-lg "
            />

            <Label htmlFor="actual_Result" className="text-sm font-medium">
              Actual Result
            </Label>

            <Textarea
              id="actual_Result"
              placeholder="Explain what actually happened. Example: Clicking submit reloads the page without saving data or showing any confirmation."
              rows={4}
              className="text-sm border-2 focus:border-primary rounded-lg "
            />
          </div>
        )}
        <p className="text-xs text-gray-500">
          Describe the issue, steps to reproduce, and browser/device.
        </p>
      </div>

      {/* Upload Image and Video */}
      <Attachment
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        selectedVideo={selectedVideo}
        setSelectedVideo={setSelectedVideo}
      />

      {/* Email (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Issue Faced By
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="proof.of.email@decentralized.biz"
          className="border-2 focus:border-primary rounded-lg"
        />
      </div>
    </div>
  );
}

export default BugForm;
