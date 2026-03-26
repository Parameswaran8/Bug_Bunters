import React, { useState, useRef } from "react";
import { ArrowUp, ArrowDown, Pin, ChevronLeft, ChevronRight, ChevronDown, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BugRightClickMenu from "./BugRightClickMenu";
import BugTableRowMenu from "./BugTableRowMenu";
import { updateBug, deleteBug } from "@/API_Call/Bug";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Returns column definitions based on the current phase
const getTableColumns = (phaseId) => {
  const commonEnd = [
    { key: "reportedDate", label: "Reported", type: "date", width: 160 },
    { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 },
  ];
  
  if (phaseId === "create") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "stack", label: "Stack", type: "stackSelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Assigned Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      ...commonEnd
    ];
  }
  
  if (phaseId === "testing") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Attachment", type: "attachment", width: 100 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      
      ...commonEnd
    ];
  }

  if (phaseId === "analyze") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Attachment", type: "attachment", width: 100 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Analyse Remark", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  if (phaseId === "reanalyze") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Attachment", type: "attachment", width: 100 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Analyse Remark", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "finalTestingRemark", label: "Final Testing Remark", type: "finalTestingRemarkText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  if (phaseId === "rtd") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Attachment", type: "attachment", width: 100 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Analyse Remark", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "finalTestingRemark", label: "Final Testing Remark", type: "finalTestingRemarkText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "deploymentStatus", label: "Deployment Status", type: "deploymentStatusSelect", width: 170 },
      { key: "deployRemark", label: "Deploy Remark", type: "deployRemarkText", width: 200 },
      { key: "finalSop", label: "Final SOP", type: "finalSopText", width: 200 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  // Default fallback
  return [
    { key: "bugId", label: "Bug ID", type: "text", width: 140 },
    { key: "toolName", label: "Tool Name", type: "text", width: 180 },
    { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
    { key: "stack", label: "Stack", type: "stackSelect", width: 120 },
    { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
    { key: "assignedTester", label: "Assigned Tester", type: "text", width: 150 },
    { key: "assignedDev", label: "Assigned Dev", type: "text", width: 150 },
    { key: "description", label: "Bug Description", type: "description", width: 250 },
    ...commonEnd
  ];
};

const priorityOptions = ["critical", "high", "medium", "low"];
const stackOptions = ["Web", "App", "Any"];

const ResizableHeader = ({ children, columnKey, colWidths, setColWidths }) => {
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = colWidths[columnKey];
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const diff = e.clientX - startX.current;
    setColWidths((prev) => ({
      ...prev,
      [columnKey]: Math.max(60, startWidth.current + diff),
    }));
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  return (
    <div className="flex items-center group" style={{ width: colWidths[columnKey], minWidth: 48 }}>
      <div className="flex-1">{children}</div>
      <div
        onMouseDown={handleMouseDown}
        className="w-4 h-6 cursor-col-resize ml-1 flex items-center justify-center"
        title="Resize"
        style={{ fontSize: "18px", color: "#cbc8c8" }}
      >
        |
      </div>
    </div>
  );
};

const ColumnHeader = ({ children, onPin, isPinned, columnKey }) => {
  const [sortOrder, setSortOrder] = useState(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer group select-none">
          <span>{children}</span>
          {isPinned && <Pin className="w-4 h-4 text-cyan-500" fill="currentColor" />}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m0-6l7-7 7 7" />
            </svg>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}>
          <ArrowUp className="w-4 h-4 mr-2" /> Sort Ascending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}>
          <ArrowDown className="w-4 h-4 mr-2" /> Sort Descending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPin(columnKey)}>
          <Pin className="w-4 h-4 mr-2" /> {isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function BugTable({ phaseBugs, onClickCardToModal, phaseId }) {
  const tableDetails = getTableColumns(phaseId);
  const { bugsList, setBugsList, allUsers, toolList } = useAuth();
  const [editingIds, setEditingIds] = useState([]);
  const [editData, setEditData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const totalPages = Math.max(1, Math.ceil((phaseBugs?.length || 0) / rowsPerPage));
  const paginatedData = phaseBugs ? phaseBugs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : [];

  const handlePinColumn = (columnKey) => {
    setPinnedColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((col) => col !== columnKey) : [...prev, columnKey]
    );
  };

  const getPinnedStyle = (columnKey) => {
    if (!pinnedColumns.includes(columnKey)) return {};
    let left = colWidths.checkbox || 48;
    for (const col of tableDetails) {
      if (col.key === columnKey) break;
      if (pinnedColumns.includes(col.key)) left += colWidths[col.key] || 160;
    }
    if (columnKey === "checkbox") left = 0;
    return {
      position: "sticky",
      left: `${left}px`,
      zIndex: 10,
      background: "white",
      boxShadow: "2px 0 2px -2px #eee",
    };
  };

  const handleEdit = (item) => {
    setEditingIds([item._id]);
    setEditData({ [item._id]: { ...item } });
  };

  const handleSave = async (id) => {
    const dataToSave = editData[id];
    
    // We update the deeply nested values dynamically if they changed
    // In our backend schema for Priority/Stack, they live in phaseI_BugReport.toolInfo
    let fallbackDevId = dataToSave.phaseII_BugConfirmation?.assignedDeveloper?._id || dataToSave.phaseII_BugConfirmation?.assignedDeveloper?.id;
    if (!fallbackDevId && toolList && dataToSave.phaseI_BugReport?.toolInfo?.toolId) {
        const mappedTool = toolList.find(t => (t.id || t._id) === dataToSave.phaseI_BugReport.toolInfo.toolId);
        if (mappedTool && mappedTool.devId) {
            fallbackDevId = typeof mappedTool.devId === "object" ? (mappedTool.devId._id || mappedTool.devId.id) : mappedTool.devId;
        }
    }

    const updatePayload = {
      "phaseI_BugReport.toolInfo.toolName": dataToSave.toolNameExtracted || dataToSave.phaseI_BugReport?.toolInfo?.toolName,
      "phaseI_BugReport.toolInfo.priority": dataToSave.priorityExtracted || dataToSave.phaseI_BugReport?.toolInfo?.priority,
      "phaseI_BugReport.toolInfo.stack": dataToSave.stackExtracted || dataToSave.phaseI_BugReport?.toolInfo?.stack,
      "phaseI_BugReport.toolInfo.bugDescription": dataToSave.bugDescriptionExtracted !== undefined ? dataToSave.bugDescriptionExtracted : dataToSave.phaseI_BugReport?.toolInfo?.bugDescription,
      "phaseI_BugReport.toolInfo.expectedResult": dataToSave.expectedResultExtracted !== undefined ? dataToSave.expectedResultExtracted : dataToSave.phaseI_BugReport?.toolInfo?.expectedResult,
      "phaseI_BugReport.toolInfo.actualResult": dataToSave.actualResultExtracted !== undefined ? dataToSave.actualResultExtracted : dataToSave.phaseI_BugReport?.toolInfo?.actualResult,
      "phaseII_BugConfirmation.testingInfo.status": dataToSave.statusExtracted !== undefined ? dataToSave.statusExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.status,
      "phaseII_BugConfirmation.testingInfo.sopFollowed": dataToSave.sopFollowedExtracted !== undefined ? dataToSave.sopFollowedExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.sopFollowed,
      "phaseII_BugConfirmation.testingInfo.remarks": dataToSave.remarksExtracted !== undefined ? dataToSave.remarksExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.remarks,
      "phaseII_BugConfirmation.assignedDeveloper": dataToSave.devExtracted !== undefined ? dataToSave.devExtracted : fallbackDevId,
      "phaseIII_BugAnalysis.analysisInfo.remarks": dataToSave.analyzeRemarkExtracted !== undefined ? dataToSave.analyzeRemarkExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.remarks,
      "phaseIII_BugAnalysis.analysisInfo.sopProvided": dataToSave.sopSolutionExtracted !== undefined ? dataToSave.sopSolutionExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.sopProvided,
      "phaseIII_BugAnalysis.analysisInfo.delayedReason": dataToSave.delayedReasonExtracted !== undefined ? dataToSave.delayedReasonExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.delayedReason,
      "phaseIV_Maintenance.maintenanceInfo.testingFlag": dataToSave.testingFlagExtracted !== undefined ? dataToSave.testingFlagExtracted : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.testingFlag,
      "phaseIV_Maintenance.maintenanceInfo.remarks": dataToSave.finalTestingRemarkExtracted !== undefined ? dataToSave.finalTestingRemarkExtracted : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.remarks,
      "phaseV_FinalTesting.testingInfo.deploymentStatus": dataToSave.deploymentStatusExtracted !== undefined ? dataToSave.deploymentStatusExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.deploymentStatus,
      "phaseV_FinalTesting.testingInfo.deployRemark": dataToSave.deployRemarkExtracted !== undefined ? dataToSave.deployRemarkExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.deployRemark,
      "phaseV_FinalTesting.testingInfo.finalSop": dataToSave.finalSopExtracted !== undefined ? dataToSave.finalSopExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.finalSop,
    };

    if (dataToSave.currentPhaseExtracted) {
      updatePayload.currentPhase = dataToSave.currentPhaseExtracted;
      updatePayload.bugPhaseNo = dataToSave.bugPhaseNoExtracted;
      
      const bugToUpdate = phaseBugs.find(b => (b.id || b._id) === id);
      if (bugToUpdate?.currentPhase === "Bug Testing" && dataToSave.currentPhaseExtracted === "Bug Analysis") {
         updatePayload["phaseII_BugConfirmation.testedAt"] = new Date().toISOString();
      }
    }

    const finalTestingFlag = updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] !== undefined ? updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.testingFlag;
    
    try {
      const res = await updateBug({ id, ...updatePayload });
      // Force instant frontend sync
      setBugsList((prev) =>
        prev.map((bug) => {
          if (bug._id === id) {
             const newBug = {...bug};
             newBug.phaseI_BugReport.toolInfo.toolName = updatePayload["phaseI_BugReport.toolInfo.toolName"];
             newBug.phaseI_BugReport.toolInfo.priority = updatePayload["phaseI_BugReport.toolInfo.priority"];
             newBug.phaseI_BugReport.toolInfo.stack = updatePayload["phaseI_BugReport.toolInfo.stack"];
             newBug.phaseI_BugReport.toolInfo.bugDescription = updatePayload["phaseI_BugReport.toolInfo.bugDescription"];
             newBug.phaseI_BugReport.toolInfo.expectedResult = updatePayload["phaseI_BugReport.toolInfo.expectedResult"];
             newBug.phaseI_BugReport.toolInfo.actualResult = updatePayload["phaseI_BugReport.toolInfo.actualResult"];
             
             if (!newBug.phaseII_BugConfirmation) newBug.phaseII_BugConfirmation = { testingInfo: {} };
             if (!newBug.phaseII_BugConfirmation.testingInfo) newBug.phaseII_BugConfirmation.testingInfo = {};
             
             if (updatePayload["phaseII_BugConfirmation.testingInfo.status"] !== undefined) {
                 newBug.phaseII_BugConfirmation.testingInfo.status = updatePayload["phaseII_BugConfirmation.testingInfo.status"];
             }
             if (updatePayload["phaseII_BugConfirmation.testingInfo.sopFollowed"] !== undefined) {
                 newBug.phaseII_BugConfirmation.testingInfo.sopFollowed = updatePayload["phaseII_BugConfirmation.testingInfo.sopFollowed"];
             }
             if (updatePayload["phaseII_BugConfirmation.testingInfo.remarks"] !== undefined) {
                 newBug.phaseII_BugConfirmation.testingInfo.remarks = updatePayload["phaseII_BugConfirmation.testingInfo.remarks"];
             }
             if (updatePayload["phaseII_BugConfirmation.assignedDeveloper"] !== undefined) {
                 const devId = updatePayload["phaseII_BugConfirmation.assignedDeveloper"];
                 const matchedUser = allUsers?.find(u => u.id === devId || u._id === devId);
                 if (matchedUser) {
                     newBug.phaseII_BugConfirmation.assignedDeveloper = { _id: matchedUser._id || matchedUser.id, name: matchedUser.name, email: matchedUser.email };
                 } else {
                     newBug.phaseII_BugConfirmation.assignedDeveloper = devId; // fallback
                 }
             }
             if (updatePayload["phaseII_BugConfirmation.testedAt"] !== undefined) {
                 newBug.phaseII_BugConfirmation.testedAt = updatePayload["phaseII_BugConfirmation.testedAt"];
             }
             
             if (!newBug.phaseIII_BugAnalysis) newBug.phaseIII_BugAnalysis = { analysisInfo: {} };
             if (!newBug.phaseIII_BugAnalysis.analysisInfo) newBug.phaseIII_BugAnalysis.analysisInfo = {};
             
             if (updatePayload["phaseIII_BugAnalysis.analysisInfo.remarks"] !== undefined) {
                 newBug.phaseIII_BugAnalysis.analysisInfo.remarks = updatePayload["phaseIII_BugAnalysis.analysisInfo.remarks"];
             }
             if (updatePayload["phaseIII_BugAnalysis.analysisInfo.sopProvided"] !== undefined) {
                 newBug.phaseIII_BugAnalysis.analysisInfo.sopProvided = updatePayload["phaseIII_BugAnalysis.analysisInfo.sopProvided"];
             }
             if (updatePayload["phaseIII_BugAnalysis.analysisInfo.delayedReason"] !== undefined) {
                 newBug.phaseIII_BugAnalysis.analysisInfo.delayedReason = updatePayload["phaseIII_BugAnalysis.analysisInfo.delayedReason"];
             }
             
             if (!newBug.phaseIV_Maintenance) newBug.phaseIV_Maintenance = { maintenanceInfo: {} };
             if (!newBug.phaseIV_Maintenance.maintenanceInfo) newBug.phaseIV_Maintenance.maintenanceInfo = {};
             
             if (updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] !== undefined) {
                 newBug.phaseIV_Maintenance.maintenanceInfo.testingFlag = updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"];
             }
              if (updatePayload["phaseIV_Maintenance.maintenanceInfo.remarks"] !== undefined) {
                 newBug.phaseIV_Maintenance.maintenanceInfo.remarks = updatePayload["phaseIV_Maintenance.maintenanceInfo.remarks"];
              }
              
              if (!newBug.phaseV_FinalTesting) newBug.phaseV_FinalTesting = { testingInfo: {} };
              if (!newBug.phaseV_FinalTesting.testingInfo) newBug.phaseV_FinalTesting.testingInfo = {};
              
              if (updatePayload["phaseV_FinalTesting.testingInfo.deploymentStatus"] !== undefined) {
                 newBug.phaseV_FinalTesting.testingInfo.deploymentStatus = updatePayload["phaseV_FinalTesting.testingInfo.deploymentStatus"];
              }
              if (updatePayload["phaseV_FinalTesting.testingInfo.deployRemark"] !== undefined) {
                 newBug.phaseV_FinalTesting.testingInfo.deployRemark = updatePayload["phaseV_FinalTesting.testingInfo.deployRemark"];
              }
              if (updatePayload["phaseV_FinalTesting.testingInfo.finalSop"] !== undefined) {
                 newBug.phaseV_FinalTesting.testingInfo.finalSop = updatePayload["phaseV_FinalTesting.testingInfo.finalSop"];
              }

              if (dataToSave.currentPhaseExtracted) {
                newBug.currentPhase = dataToSave.currentPhaseExtracted;
                newBug.bugPhaseNo = dataToSave.bugPhaseNoExtracted;
             }
             
             return newBug;
          }
          return bug;
        })
      );
      toast.success("Bug updated successfully");
    } catch (error) {
       toast.error("Failed to update bug");
    }

    setEditingIds((prev) => prev.filter((eid) => eid !== id));
    setEditData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  const handleCancel = (id) => {
    setEditingIds((prev) => prev.filter((eid) => eid !== id));
    setEditData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleEditSelected = () => {
    if (selectedRows.length > 0) {
      setEditingIds(selectedRows);
      const newEditData = {};
      selectedRows.forEach((id) => {
        const item = bugsList.find((i) => i._id === id);
        if (item) newEditData[id] = { ...item };
      });
      setEditData(newEditData);
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedRows) {
        // await deleteBug({ id }); // Backend soft delete
    }
    toast.success("Feature Mock (Bugs Deleted)");
    setSelectedRows([]);
  };

  const handleDeleteSingle = async (id) => {
    // await deleteBug({ id });
    toast.success("Feature Mock (Bug Archive)");
  };

  const handleSaveAll = async () => {
    for (const id of editingIds) {
      if (editData[id]) await handleSave(id);
    }
    setEditingIds([]);
    setEditData({});
    setSelectedRows([]);
  };

  const handleCancelAll = () => {
    setEditingIds([]);
    setEditData({});
    setSelectedRows([]);
  };

  const renderCell = (col, rawItem, isEditing, displayData, setRowEditData) => {
    // Because data is nested deeply, we extract them virtually for editing
    const toolName = displayData.toolNameExtracted || rawItem.phaseI_BugReport?.toolInfo?.toolName || "-";
    const priority = displayData.priorityExtracted || rawItem.phaseI_BugReport?.toolInfo?.priority || "low";
    
    let stack = displayData.stackExtracted || rawItem.phaseI_BugReport?.toolInfo?.stack;
    if (!stack || stack === "-" || stack === "") {
        const foundTool = toolList?.find(t => (t.id || t._id) === rawItem.phaseI_BugReport?.toolInfo?.toolId);
        if (foundTool && Array.isArray(foundTool.stack) && foundTool.stack.length > 0) {
            stack = foundTool.stack[0];
        } else {
            stack = "-";
        }
    }
    
    // Description extractions
    const bugDesc = displayData.bugDescriptionExtracted !== undefined 
      ? displayData.bugDescriptionExtracted 
      : rawItem.phaseI_BugReport?.toolInfo?.bugDescription || "";
      
    const expRes = displayData.expectedResultExtracted !== undefined 
      ? displayData.expectedResultExtracted 
      : rawItem.phaseI_BugReport?.toolInfo?.expectedResult || "";
      
    const actRes = displayData.actualResultExtracted !== undefined 
      ? displayData.actualResultExtracted 
      : rawItem.phaseI_BugReport?.toolInfo?.actualResult || "";
      
    const isExpectedMode = expRes && expRes !== "Not Applicable (Simple Description)";
    
    // User mappings - Add email handling
    let raiserObj = rawItem.phaseI_BugReport?.reportedBy;
    if (raiserObj && (typeof raiserObj !== "object" || !raiserObj.name)) {
        const idToCheck = typeof raiserObj === "object" ? (raiserObj._id || raiserObj.id) : raiserObj;
        const found = allUsers?.find(u => (u.id || u._id) === idToCheck);
        if (found) raiserObj = found;
    }
    const raiser = raiserObj?.name || "Unknown";
    const raiserEmail = raiserObj?.email || "No email provided";
    
    // Bug Tester uses assignedTester in Phase I, or testedBy in Phase II, default to assignedTester
    let testerObj = rawItem.phaseI_BugReport?.assignedTester || rawItem.phaseII_BugConfirmation?.testedBy;
    if (testerObj && (typeof testerObj !== "object" || !testerObj.name)) {
        const idToCheck = typeof testerObj === "object" ? (testerObj._id || testerObj.id) : testerObj;
        const found = allUsers?.find(u => (u.id || u._id) === idToCheck);
        if (found) testerObj = found;
    }
    const tester = testerObj?.name || "";
    const testerEmail = testerObj?.email || "No email provided";
    
    // Developer extraction uses edit data dynamically, or default from Phase 2
    let developerObj = rawItem.phaseII_BugConfirmation?.assignedDeveloper;
    if (isEditing && displayData.devExtracted) {
        developerObj = allUsers?.find(u => (u.id || u._id) === displayData.devExtracted);
    }
    const developer = developerObj?.name || "";
    const developerEmail = developerObj?.email || "No email provided";
    
    // New testing fields
    const bugStatusOptions = ["No Bug", "Minor Bugs", "Error Unlocatted", "Actual Issue", "Resolved"];
    const bugStatus = displayData.statusExtracted ?? rawItem.phaseII_BugConfirmation?.testingInfo?.status ?? "-";
    
    const sopFollowedArr = displayData.sopFollowedExtracted !== undefined ? displayData.sopFollowedExtracted : rawItem.phaseII_BugConfirmation?.testingInfo?.sopFollowed;
    const sopFollowedStr = sopFollowedArr && sopFollowedArr.length > 0 ? sopFollowedArr.join(', ') : '';
    
    const remarks = displayData.remarksExtracted !== undefined ? displayData.remarksExtracted : rawItem.phaseII_BugConfirmation?.testingInfo?.remarks || "";

    // New analysis fields
    const analyzeRemark = displayData.analyzeRemarkExtracted !== undefined ? displayData.analyzeRemarkExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.remarks || "";
    
    const sopSolutionArr = displayData.sopSolutionExtracted !== undefined ? displayData.sopSolutionExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.sopProvided;
    const sopSolutionStr = sopSolutionArr && sopSolutionArr.length > 0 ? sopSolutionArr.join(', ') : '';
    
    const delayedReason = displayData.delayedReasonExtracted !== undefined ? displayData.delayedReasonExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.delayedReason || "";
    
    if (col.key === "bugId") {
       return <span className="font-medium text-cyan-600 cursor-pointer" onClick={() => onClickCardToModal(rawItem)}>{rawItem.bugId || "N/A"}</span>;
    }

    if (col.key === "reportedDate") {
        return <span className="text-gray-500 whitespace-nowrap">
          {rawItem.phaseI_BugReport?.reportedAt ? new Date(rawItem.phaseI_BugReport.reportedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : "-"}
        </span>;
    }

    if (col.key === "bugTestedDate") {
        return <span className="text-gray-500 whitespace-nowrap">
          {rawItem.phaseII_BugConfirmation?.testedAt ? new Date(rawItem.phaseII_BugConfirmation.testedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : "-"}
        </span>;
    }

    if (col.key === "toolName") {
      return isEditing ? (
        <Input 
          value={toolName} 
          onChange={(e) => setRowEditData({ toolNameExtracted: e.target.value })} 
          className="h-8 w-full" 
        />
      ) : (
        <span className="font-medium text-gray-900">{toolName}</span>
      );
    }

    if (col.key === "bugRaiser") {
      return <span className="text-gray-600 truncate block w-full" title={raiserEmail}>{raiser}</span>;
    }

    if (col.type === "facedByCard") {
      const clientCtx = rawItem.phaseI_BugReport?.clientContext;
      if (!clientCtx) return <span className="text-gray-400">-</span>;

      if (clientCtx.facedByMe) {
        return <span className="text-gray-700 font-medium">Me</span>;
      } else if (clientCtx.facedByClient) {
        return (
          <div className="flex flex-col text-xs text-gray-700 truncate min-w-[120px]">
            <span className="font-semibold truncate">{clientCtx.clientName || "Unknown Client"}</span>
            <span className="text-gray-500 truncate">{clientCtx.companyName || "Unknown Company"}</span>
          </div>
        );
      }
      return <span className="text-gray-400">-</span>;
    }

    if (col.type === "sopFollowedRaiserCard") {
      const sopChecklist = rawItem.phaseI_BugReport?.clientContext?.sopChecklist;
      if (!sopChecklist || Object.keys(sopChecklist).length === 0) {
        return <span className="text-gray-400 px-2 block w-full">-</span>;
      }
      
      const followedItems = Object.entries(sopChecklist)
        .filter(([_, isChecked]) => isChecked)
        .map(([text, _]) => text);
        
      if (followedItems.length === 0) return <span className="text-gray-400 px-2 block w-full">None</span>;
      
      return (
        <ul className="list-disc pl-5 text-xs text-gray-700 m-0 max-h-20 overflow-y-auto block w-full pr-1" title={followedItems.join('\n')}>
          {followedItems.map((item, idx) => (
             <li key={idx} className="truncate" title={item}>{item}</li>
          ))}
        </ul>
      );
    }

    if (col.key === "assignedTester") {
      return <span className="text-gray-600 truncate block w-full" title={testerEmail}>{tester}</span>;
    }

    if (col.type === "devSelect" && col.key === "assignedDev") {
      if (isEditing) {
        const devs = allUsers?.filter(u => (Array.isArray(u.roletype) ? u.roletype.includes("dev") : u.roletype === "dev") || (u.roles && u.roles.includes("Developer"))) || [];
        
        let selectedDevId = displayData.devExtracted ?? developerObj?._id ?? developerObj?.id;
        
        // Auto-select tool dev if unset
        if (!selectedDevId && toolList && (rawItem.phaseI_BugReport?.toolInfo?.toolId)) {
           const mappedTool = toolList.find(t => (t.id || t._id) === rawItem.phaseI_BugReport.toolInfo.toolId);
           if (mappedTool && mappedTool.devId) {
              const dId = typeof mappedTool.devId === "object" ? (mappedTool.devId._id || mappedTool.devId.id) : mappedTool.devId;
              selectedDevId = dId;
           }
        }
        
        const selectedDevLabel = devs.find(d => (d.id || d._id) === selectedDevId)?.name || "Select Developer";
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
                 <span className="truncate">{selectedDevLabel}</span>
                 <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 max-h-48 overflow-auto z-50">
              {devs.map((dev) => (
                 <DropdownMenuItem
                   key={dev.id || dev._id}
                   className="text-xs py-1.5 cursor-pointer"
                   onClick={(e) => {
                     e.stopPropagation();
                     setRowEditData({ devExtracted: dev.id || dev._id });
                   }}
                 >
                   {dev.name || dev.username || dev.email}
                 </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        return <span className="text-gray-600 truncate block w-full" title={developerEmail}>{developer}</span>;
      }
    }

    if (col.key === "attachments" || col.type === "attachment") {
      const phase1Attach = rawItem.phaseI_BugReport?.toolInfo?.attachments;
      if (phase1Attach && phase1Attach.length > 0) {
        return (
           <a href={phase1Attach[0].url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-800 underline text-sm whitespace-nowrap">
             View File
           </a>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
    
    if (col.key === "testingAttachment" || col.type === "testingAttachment") {
      const phase2Attach = rawItem.phaseII_BugConfirmation?.testingInfo?.attachments;
      if (phase2Attach && phase2Attach.length > 0) {
        return (
           <a href={phase2Attach[0].url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-800 underline text-sm whitespace-nowrap">
             View File
           </a>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
    
    if (col.key === "analyzeAttachment" || col.type === "analyzeAttachment") {
      const phase3Attach = rawItem.phaseIII_BugAnalysis?.analysisInfo?.attachments;
      if (phase3Attach && phase3Attach.length > 0) {
        return (
           <a href={phase3Attach[0].url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-800 underline text-sm whitespace-nowrap">
             View File
           </a>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
    
    if (col.type === "analyzeRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y" rows={2} placeholder="Add Analyse Remarks..." value={analyzeRemark} onChange={(e) => setRowEditData({ analyzeRemarkExtracted: e.target.value })} />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={analyzeRemark !== "-" ? analyzeRemark : ""}>{analyzeRemark || "-"}</span>;
    }
    
    if (col.type === "delayedReasonText") {
       if (isEditing) {
          return (
             <Input className="h-8 w-full text-xs" placeholder="Delayed Reason..." value={delayedReason} onChange={(e) => setRowEditData({ delayedReasonExtracted: e.target.value })} />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={delayedReason !== "-" ? delayedReason : ""}>{delayedReason || "-"}</span>;
    }
    
    if (col.type === "sopSolutionText") {
      if (isEditing) {
        return (
          <Input 
            className="h-8 w-full text-xs" 
            placeholder="SOP for solution (comma separated)"
            value={sopSolutionStr}
            onChange={(e) => {
              const raw = e.target.value;
              const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
              setRowEditData({ sopSolutionExtracted: arr });
            }}
          />
        );
      } else {
        return <span className="text-gray-600 text-xs truncate block w-full" title={sopSolutionStr !== "-" ? sopSolutionStr : ""}>{sopSolutionStr || "-"}</span>;
      }
    }
    
    if (col.key === "remarks" || col.type === "remarksText") {
       if (isEditing) {
          return (
            <textarea 
              className="w-full text-xs border rounded p-1 resize-y" 
              rows={2}
              placeholder="Add remarks..."
              value={remarks}
              onChange={(e) => setRowEditData({ remarksExtracted: e.target.value })}
            />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={remarks !== "-" ? remarks : ""}>{remarks || "-"}</span>;
    }

    const finalTestingRemark = displayData.finalTestingRemarkExtracted !== undefined ? displayData.finalTestingRemarkExtracted : rawItem.phaseIV_Maintenance?.maintenanceInfo?.remarks || "";

    if (col.type === "finalTestingRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y" rows={2} placeholder="Add Final Testing Remarks..." value={finalTestingRemark} onChange={(e) => setRowEditData({ finalTestingRemarkExtracted: e.target.value })} />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={finalTestingRemark !== "-" ? finalTestingRemark : ""}>{finalTestingRemark || "-"}</span>;
    }

    const deployRemark = displayData.deployRemarkExtracted !== undefined ? displayData.deployRemarkExtracted : rawItem.phaseV_FinalTesting?.testingInfo?.deployRemark || "";
    if (col.type === "deployRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y bg-emerald-50/30" rows={2} placeholder="Add Deploy Remarks..." value={deployRemark} onChange={(e) => setRowEditData({ deployRemarkExtracted: e.target.value })} />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={deployRemark || ""}>{deployRemark || "-"}</span>;
    }

    const finalSop = displayData.finalSopExtracted !== undefined ? displayData.finalSopExtracted : rawItem.phaseV_FinalTesting?.testingInfo?.finalSop || "";
    if (col.type === "finalSopText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y bg-emerald-50/30" rows={2} placeholder="Add Final SOP..." value={finalSop} onChange={(e) => setRowEditData({ finalSopExtracted: e.target.value })} />
          );
       }
       return <span className="text-gray-600 truncate block w-full" title={finalSop || ""}>{finalSop || "-"}</span>;
    }

    if (col.type === "statusSelect") {
      if (isEditing) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start text-left shrink-0 text-[11px] px-2" onClick={(e) => e.stopPropagation()}>
                 <span className="truncate">{bugStatus}</span>
                 <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-36 z-50">
              {bugStatusOptions.map((opt) => (
                 <DropdownMenuCheckboxItem
                   key={opt}
                   checked={bugStatus === opt}
                   className="text-[11px]"
                   onClick={(e) => {
                     e.stopPropagation();
                     setRowEditData({ statusExtracted: opt });
                   }}
                 >
                   {opt}
                 </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        return <span className="text-gray-700 text-xs truncate block w-full">{bugStatus}</span>;
      }
    }
    
    if (col.type === "sopText") {
      if (isEditing) {
        return (
          <Input 
            className="h-8 w-full text-xs" 
            placeholder="SOP Followed (comma separated)"
            value={sopFollowedStr}
            onChange={(e) => {
              const raw = e.target.value;
              const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
              // We store it as array state but edit it as string via derived state
              // To make real-time typing smooth we just store standard array and display derives from it
              setRowEditData({ sopFollowedExtracted: arr });
            }}
          />
        );
      } else {
        return <span className="text-gray-600 text-xs truncate block w-full" title={sopFollowedStr !== "-" ? sopFollowedStr : ""}>{sopFollowedStr || "-"}</span>;
      }
    }

    if (col.key === "rootCause") {
       const rootCause = rawItem.phaseIII_BugAnalysis?.analysisInfo?.rootCause || "-";
       return <span className="text-gray-600 truncate block w-full">{rootCause}</span>;
    }

    if (col.type === "description") {
      if (isEditing) {
        if (isExpectedMode) {
          return (
            <div className="flex flex-col gap-2 w-full p-1 max-w-full">
              <textarea 
                className="w-[230px] text-[14px] border border-gray-300 rounded p-1.5 resize-y bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all placeholder:text-gray-400" 
                rows={2} 
                placeholder="Expected result..."
                value={expRes}
                onChange={(e) => setRowEditData({ expectedResultExtracted: e.target.value })}
              />
              <textarea 
                className="w-[230px] text-[14px] border border-gray-300 rounded p-1.5 resize-y bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all placeholder:text-gray-400" 
                rows={2} 
                placeholder="Actual result..."
                value={actRes}
                onChange={(e) => setRowEditData({ actualResultExtracted: e.target.value })}
              />
            </div>
          );
        } else {
          return (
            <textarea 
              className="w-[230px] text-[14px] border border-gray-300 rounded p-1.5 resize-y min-h-[4.5rem] bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all placeholder:text-gray-400" 
              rows={3}
              placeholder="Bug description..."
              value={bugDesc}
              onChange={(e) => setRowEditData({ bugDescriptionExtracted: e.target.value })}
            />
          );
        }
      } else {
        if (isExpectedMode) {
          const maxLines = "line-clamp-4"; 
          return (
            <div className={`text-[14px] text-gray-700 whitespace-pre-wrap ${maxLines} overflow-hidden`} title={`Expected: ${expRes}\n\nActual: ${actRes}`}>
              <span className="font-semibold text-gray-900">Expected:</span> {expRes}
              <br/><br/>
              <span className="font-semibold text-gray-900">Actual:</span> {actRes}
            </div>
          );
        } else {
          return (
            <div className="text-[14px] text-gray-700 whitespace-pre-wrap line-clamp-4 overflow-hidden" title={bugDesc}>
              {bugDesc}
            </div>
          );
        }
      }
    }

    if (col.type === "prioritySelect") {
      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start text-left shrink-0">
               {priority.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            {priorityOptions.map((opt) => (
               <DropdownMenuCheckboxItem
                 key={opt}
                 checked={priority === opt}
                 onClick={() => setRowEditData({ priorityExtracted: opt })}
               >
                 {opt.toUpperCase()}
               </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase
          ${priority === 'critical' ? 'bg-red-100 text-red-700' :
            priority === 'high' ? 'bg-orange-100 text-orange-700' :
             priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
             'bg-green-100 text-green-700'
          }`}>
          {priority}
        </span>
      );
    }

    if (col.type === "stackSelect") {
      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start text-left">
               {stack}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            {stackOptions.map((opt) => (
               <DropdownMenuCheckboxItem
                 key={opt}
                 checked={stack === opt}
                 onClick={() => setRowEditData({ stackExtracted: opt })}
               >
                 {opt}
               </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-gray-600">{stack}</span>
      );
    }

    if (col.type === "phaseSelect") {
      const currentPhaseName = displayData.currentPhaseExtracted || rawItem.currentPhase || "-";
      const availablePhases = [
        { label: "Bug Testing", value: "testing", phaseNo: 2 },
        { label: "Bug Analysis", value: "analyze", phaseNo: 3 },
        { label: "Ready to Test", value: "rtt", phaseNo: 4 },
        { label: "Ready to Deploy", value: "rtd", phaseNo: 5 },
        { label: "Closure", value: "deployed", phaseNo: 6 }
      ];

      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-between text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
               <span className="truncate">{currentPhaseName}</span>
               <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 z-50">
            {availablePhases.map((opt) => (
               <DropdownMenuItem
                 key={opt.value}
                 className="text-xs py-1.5 cursor-pointer"
                 onClick={(e) => {
                   e.stopPropagation();
                   setRowEditData({
                     currentPhaseExtracted: opt.label,
                     bugPhaseNoExtracted: opt.phaseNo
                   });
                 }}
               >
                 {opt.label}
               </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-gray-600 truncate block w-full">{currentPhaseName}</span>
      );
    }

    if (col.type === "testingFlagSelect") {
      const tsFlagOptions = ["Go back to dev", "Test by bug raiser", "Ready for rollout", "-"];
      const flagVal = displayData.testingFlagExtracted ?? rawItem.phaseIV_Maintenance?.maintenanceInfo?.testingFlag ?? "-";
      
      const getFlagColor = (val) => {
         if (val === 'Go back to dev' || val === 'Red flag') return 'text-red-500';
         if (val === 'Test by bug raiser' || val === 'Blue Flag') return 'text-blue-500';
         if (val === 'Ready for rollout' || val === 'Green Flag') return 'text-green-500';
         return 'text-gray-300';
      };

      if (isEditing) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-8 px-2 text-xs">
                 {flagVal !== "-" ? (
                   <div className="flex items-center gap-1.5 truncate">
                      <Flag className={`w-3.5 h-3.5 shrink-0 ${getFlagColor(flagVal)}`} fill="currentColor" />
                      <span className="truncate text-[11px]">{flagVal}</span>
                   </div>
                 ) : (
                   <span className="text-gray-400">Select Flag...</span>
                 )}
                 <ChevronDown className="ml-1 w-3 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 min-w-44">
               {tsFlagOptions.map(opt => (
                  <DropdownMenuItem key={opt} onClick={() => setRowEditData({ testingFlagExtracted: opt })} className="cursor-pointer">
                     {opt !== "-" ? (
                        <div className="flex items-center text-xs">
                           <Flag className={`w-3.5 h-3.5 mr-2 ${getFlagColor(opt)}`} fill="currentColor" />
                           {opt}
                        </div>
                     ) : (
                        <span className="text-xs text-gray-400 pl-6">Clear Flag</span>
                     )}
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      
      if (flagVal === "-") return <span className="text-gray-400 w-full px-2 block">-</span>;

      let flagBgClasses = 'bg-gray-50 border-gray-100 text-gray-700';
      if (flagVal === 'Go back to dev' || flagVal === 'Red flag') flagBgClasses = 'bg-red-50 border-red-200 text-red-700';
      else if (flagVal === 'Test by bug raiser' || flagVal === 'Blue Flag') flagBgClasses = 'bg-blue-50 border-blue-200 text-blue-700';
      else if (flagVal === 'Ready for rollout' || flagVal === 'Green Flag') flagBgClasses = 'bg-green-50 border-green-200 text-green-700';

      return (
        <span className={`text-[11px] px-2.5 py-1 font-medium rounded-full border inline-flex items-center gap-1.5 whitespace-nowrap ${flagBgClasses}`}>
           <Flag className={`w-3 h-3 ${getFlagColor(flagVal)}`} fill="currentColor" />
           {flagVal}
        </span>
      );
    }
    
    if (col.type === "deploymentStatusSelect") {
      const deployOptions = ["Done", "Hold", "For date", "Approval For deploy", "-"];
      const statusVal = displayData.deploymentStatusExtracted ?? rawItem.phaseV_FinalTesting?.testingInfo?.deploymentStatus ?? "-";
      if (isEditing) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-8 px-2 text-xs">
                 <span className="truncate">{statusVal !== "-" ? statusVal : "Select Status..."}</span>
                 <ChevronDown className="ml-1 w-3 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50 min-w-44">
               {deployOptions.map(opt => (
                  <DropdownMenuItem key={opt} onClick={() => setRowEditData({ deploymentStatusExtracted: opt })} className="cursor-pointer">
                     {opt !== "-" ? opt : <span className="text-xs text-gray-400">Clear</span>}
                  </DropdownMenuItem>
               ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      
      if (statusVal === "-") return <span className="text-gray-400 w-full px-2 block">-</span>;
      return (
        <span className="text-[11px] px-2.5 py-1 font-medium rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center break-words">
           {statusVal}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <div className="[&>div]:rounded-sm [&>div]:border overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] min-h-[160px] mt-4 shadow-sm bg-white relative">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="p-0 flex items-center justify-center h-16 sticky left-0 z-30 bg-white shadow-[2px_0_2px_-2px_#eee]" style={{ width: colWidths.checkbox || 48, minWidth: 48, maxWidth: 120, top: 0 }}>
                <Checkbox 
                  checked={paginatedData?.length > 0 && selectedRows.length === paginatedData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(paginatedData.map(item => item._id || item.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </TableHead>
              {tableDetails.map((col) => {
                const isPinned = pinnedColumns.includes(col.key);
                const pinStyle = getPinnedStyle(col.key);
                const isPhase2Target = ['testing', 'analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['bugStatus', 'sopFollowed', 'remarks', 'testingAttachment', 'assignedDev'].includes(col.key);
                const isPhase3Target = ['analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['analyzeRemark', 'sopForSolution', 'delayedReason', 'analyzeAttachment'].includes(col.key);
                const isPhase4Target = ['analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['testingFlag', 'finalTestingRemark'].includes(col.key);
                const isPhase5Target = ['rtd'].includes(phaseId) && ['deploymentStatus', 'deployRemark', 'finalSop'].includes(col.key);
                
                let textColor = "";
                let bgActiveColor = "white";
                
                if (isPhase5Target) {
                    textColor = "text-[#059669]"; // emerald-600
                    bgActiveColor = "#ecfdf5";    // emerald-50
                } else if (isPhase4Target) {
                    textColor = "text-[#ea580c]"; // amber-600
                    bgActiveColor = "#fffbeb";    // amber-50
                } else if (isPhase3Target) {
                    textColor = "text-[#7c3aed]";
                    bgActiveColor = "#f5f3ff";
                } else if (isPhase2Target) {
                    textColor = "text-[#4f46e5]";
                    bgActiveColor = "#eef2ff";
                }

                return (
                <TableHead key={col.key} className={`sticky ${textColor}`} style={{ ...pinStyle, width: colWidths[col.key], minWidth: 60, maxWidth: 600, top: 0, zIndex: isPinned ? 30 : 20, backgroundColor: isPinned ? 'white' : bgActiveColor }}>
                  <ResizableHeader columnKey={col.key} colWidths={colWidths} setColWidths={setColWidths}>
                    <ColumnHeader columnKey={col.key} onPin={handlePinColumn} isPinned={isPinned}>
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
                );
              })}
              <TableHead className="sticky right-0 top-0 bg-white shadow-[-2px_0_2px_-2px_#eee]" style={{ width: 120, minWidth: 60, maxWidth: 600, zIndex: 30 }}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(!paginatedData || paginatedData.length === 0) ? (
              <TableRow>
                 <TableCell colSpan={tableDetails.length + 2} className="text-center py-10 text-gray-500">
                    No bugs in this phase yet.
                 </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const isEditing = editingIds.includes(item._id);
                const displayData = isEditing && editData[item._id] ? editData[item._id] : item;

                return (
                  <BugRightClickMenu
                    key={item._id}
                    item={item}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDeleteSingle(item._id)}
                    onSaveAll={handleSaveAll}
                    onEditSelected={handleEditSelected}
                    onDeleteSelected={handleDeleteSelected}
                    onCancelAll={handleCancelAll}
                  >
                    <TableRow className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <TableCell className="p-0 flex items-center justify-center h-16 sticky left-0 z-10 bg-white" style={{ width: colWidths.checkbox || 48, minWidth: 48, maxWidth: 120 }}>
                        <Checkbox checked={selectedRows.includes(item._id)} onCheckedChange={() => handleRowSelect(item._id)} />
                      </TableCell>
                      
                      {tableDetails.map((col) => {
                        const isPhase2Target = ['testing', 'analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['bugStatus', 'sopFollowed', 'remarks', 'testingAttachment', 'assignedDev'].includes(col.key);
                        const isPhase3Target = ['analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['analyzeRemark', 'sopForSolution', 'delayedReason', 'analyzeAttachment'].includes(col.key);
                        const isPhase4Target = ['analyze', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['testingFlag', 'finalTestingRemark'].includes(col.key);
                        const isPhase5Target = ['rtd'].includes(phaseId) && ['deploymentStatus', 'deployRemark', 'finalSop'].includes(col.key);

                        let cellBg = undefined;
                        if (isPhase5Target) {
                            cellBg = "bg-emerald-50/30";
                        } else if (isPhase4Target) {
                            cellBg = "#fffbeb";
                        } else if (isPhase3Target) {
                            cellBg = "#f5f3ff";
                        } else if (isPhase2Target) {
                            cellBg = "#eef2ff";
                        }

                        // if column is pinned, override background to white so hover doesn't break, unless it's a phase target but testing phase target won't be pinned usually.
                        return (
                        <TableCell key={col.key} style={{ ...getPinnedStyle(col.key), width: colWidths[col.key], minWidth: 60, maxWidth: 600, backgroundColor: cellBg }}>
                          {renderCell(col, item, isEditing, displayData, (val) =>
                            setEditData((prev) => ({
                              ...prev,
                              [item._id]: { ...(prev[item._id] || item), ...val },
                            }))
                          )}
                        </TableCell>
                        );
                      })}

                      <TableCell className="sticky right-0 bg-white z-10" style={{ width: 120, minWidth: 60, maxWidth: 600 }}>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSave(item._id)} className="h-8 px-3">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancel(item._id)} className="h-8 px-3">Cancel</Button>
                          </div>
                        ) : (
                          <BugTableRowMenu item={item} onEdit={() => handleEdit(item)} onDelete={() => handleDeleteSingle(item._id)} onArchive={() => console.log('archive')}/>
                        )}
                      </TableCell>
                    </TableRow>
                  </BugRightClickMenu>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page:</span>
            <select
              className="border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-700 outline-none"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing {phaseBugs?.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, phaseBugs?.length || 0)} of {phaseBugs?.length || 0} bugs
          </div>
        </div>
        <div className="flex items-center space-x-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium px-2">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
