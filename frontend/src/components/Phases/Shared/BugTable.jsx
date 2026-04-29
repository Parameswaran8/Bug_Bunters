import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, Pin, ChevronLeft, ChevronRight, ChevronDown, Flag, Check, X, LibraryBig } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileUploader from "../../Shared/FileUploader";
import AttachmentGallery from "../../Shared/AttachmentGallery";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ─────────────── Tooltip Helper ─────────────── */
const CellTooltip = ({ children, content }) => {
  if (!content) return children;
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px] break-words">
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

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
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
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
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
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
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
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
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "finalTestingRemark", label: "Final Testing Remark", type: "finalTestingRemarkText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "bugAnalysedDate", label: "Bug Analysed", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  if (phaseId === "maintenance") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "maintenanceRemark", label: "Maintenance Remark", type: "maintenanceRemarkText", width: 200 },
      { key: "maintenanceSOP", label: "Maintenance SOP", type: "maintenanceSopText", width: 200 },
      { key: "finalTestingRemark", label: "Final Testing Remark", type: "finalTestingRemarkText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "bugAnalysedDate", label: "Bug Analysed", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  if (phaseId === "rtt") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP Followed by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "finalTestingRemark", label: "Final Testing Remark", type: "finalTestingRemarkText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "bugAnalysedDate", label: "Bug Analysed", type: "date", width: 180 },
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
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
      { key: "sopFollowed", label: "SOP Followed", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "assignedDev", label: "Forward to Developer", type: "devSelect", width: 180 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
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
      { key: "bugAnalysedDate", label: "Bug Analysed", type: "date", width: 180 },
      { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 }
    ];
  }

  if (phaseId === "all_full" || phaseId === "deployed") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "stack", label: "Stack", type: "stackSelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "issueFacedBy", label: "Issue Faced By", type: "facedByCard", width: 160 },
      { key: "assignedTester", label: "Assigned Tester", type: "text", width: 150 },
      { key: "assignedDev", label: "Assigned Dev", type: "text", width: 150 },
      { key: "description", label: "Bug Description", type: "description", width: 250 },
      { key: "sopFollowedRaiser", label: "SOP by Raiser", type: "sopFollowedRaiserCard", width: 220 },
      { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
      { key: "bugStatus", label: "Bug Status", type: "statusSelect", width: 150 },
      { key: "sopFollowed", label: "Tester SOP", type: "sopText", width: 160 },
      { key: "remarks", label: "Testing Remark", type: "remarksText", width: 200 },
      { key: "testingAttachment", label: "Testing Attachment", type: "testingAttachment", width: 140 },
      { key: "analyzeRemark", label: "Root Cause", type: "analyzeRemarkText", width: 200 },
      { key: "sopForSolution", label: "SOP for Solution", type: "sopSolutionText", width: 200 },
      { key: "delayedReason", label: "Delayed Reason", type: "delayedReasonText", width: 200 },
      { key: "analyzeAttachment", label: "Analyse Attachment", type: "analyzeAttachment", width: 140 },
      { key: "maintenanceRemark", label: "Maintenance Remark", type: "maintenanceRemarkText", width: 200 },
      { key: "maintenanceSOP", label: "Maintenance SOP", type: "maintenanceSopText", width: 200 },
      { key: "testingFlag", label: "Testing Flag", type: "testingFlagSelect", width: 160 },
      { key: "deploymentStatus", label: "Deployment Status", type: "deploymentStatusSelect", width: 170 },
      { key: "deployRemark", label: "Deploy Remark", type: "deployRemarkText", width: 200 },
      { key: "finalSop", label: "Final SOP", type: "finalSopText", width: 200 },
      { key: "reportedDate", label: "Reported", type: "date", width: 180 },
      { key: "bugTestedDate", label: "Bug Tested", type: "date", width: 180 },
      { key: "bugAnalysedDate", label: "Bug Analysed", type: "date", width: 180 },
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
    { key: "attachments", label: "Bug Attachments", type: "attachment", width: 150 },
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
        {columnKey !== "bugId" && (
          <DropdownMenuItem onClick={() => onPin(columnKey)}>
            <Pin className="w-4 h-4 mr-2" /> {isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const PHASE_EDITABLE_MAP = {
  "Bug Reported": ["toolName", "priority", "stack", "description", "assignedTester", "currentPhase", "attachments"],
  "Bug Testing": ["bugStatus", "sopFollowed", "remarks", "testingAttachment", "assignedDev", "currentPhase"],
  "Bug Confirmation": ["bugStatus", "sopFollowed", "remarks", "testingAttachment", "assignedDev", "currentPhase"],
  "Bug Analysis": ["analyzeRemark", "sopForSolution", "delayedReason", "analyzeAttachment", "currentPhase", "rootCause"],
  "Ready to Test": ["finalTestingRemark", "testingFlag", "currentPhase"],
  "Maintenance": ["maintenanceRemark", "maintenanceSOP", "finalTestingRemark", "testingFlag", "currentPhase"],
  "Ready to Deploy": ["deploymentStatus", "deployRemark", "finalSop", "currentPhase"],
  "Final Testing": ["deploymentStatus", "deployRemark", "finalSop", "currentPhase"],
  "Deployed": ["currentPhase"],
  "Closure": ["currentPhase"],
};

/**
 * Returns true if this column is editable given the restriction list.
 * @param {string} colKey        - column key from tableDetails
 * @param {object} item          - the bug object
 * @param {string[] | null | undefined} editableColumnKeys
 */
function isColEditable(colKey, item, editableColumnKeys) {
  if (colKey === "bugId") return false;

  // 1. Determine columns allowed for the bug's current phase
  const currentPhase = item?.currentPhase;
  const phaseAllowed = PHASE_EDITABLE_MAP[currentPhase] || [];
  
  if (!phaseAllowed.includes(colKey)) return false;

  // 2. Check role-based restrictions
  if (editableColumnKeys === null || editableColumnKeys === undefined) return true;
  return editableColumnKeys.includes(colKey);
}

export default function BugTable({ phaseBugs, onClickCardToModal, phaseId, editableColumnKeys, canEditRow }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tableDetails = getTableColumns(phaseId);
  const { bugsList, setBugsList, allUsers, toolList } = useAuth();
  const [editingIds, setEditingIds] = useState([]);
  const [editData, setEditData] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const [pinnedColumns, setPinnedColumns] = useState(["bugId"]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );

  // Synchronize colWidths whenever tableDetails changes (switching phases)
  // This ensures new columns have an initial width so resizing doesn't fail with NaN
  useEffect(() => {
    setColWidths((prev) => {
      const updated = { ...prev };
      let changed = false;
      tableDetails.forEach((col) => {
        if (!(col.key in updated)) {
          updated[col.key] = col.width || 160;
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [tableDetails]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const totalPages = Math.max(1, Math.ceil((phaseBugs?.length || 0) / rowsPerPage));
  const paginatedData = phaseBugs ? phaseBugs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : [];

  const handlePinColumn = (columnKey) => {
    // Bug ID is always pinned
    if (columnKey === "bugId") return;

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
      boxShadow: "2px 0 2px -2px #eee",
    };
  };

  // Returns true when the current user is allowed to edit this specific row.
  const isRowEditable = (item) => {
    if (canEditRow === null || canEditRow === undefined) return true; // admin or phase-scoped (all editable)
    if (typeof canEditRow === "function") return canEditRow(item);
    return true;
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
      "phaseI_BugReport.toolInfo.toolId": dataToSave.toolIdExtracted || dataToSave.phaseI_BugReport?.toolInfo?.toolId,
      "phaseI_BugReport.toolInfo.priority": dataToSave.priorityExtracted || dataToSave.phaseI_BugReport?.toolInfo?.priority,
      "phaseI_BugReport.toolInfo.stack": dataToSave.stackExtracted || dataToSave.phaseI_BugReport?.toolInfo?.stack,
      "phaseI_BugReport.toolInfo.bugDescription": dataToSave.bugDescriptionExtracted !== undefined ? dataToSave.bugDescriptionExtracted : dataToSave.phaseI_BugReport?.toolInfo?.bugDescription,
      "phaseI_BugReport.toolInfo.expectedResult": dataToSave.expectedResultExtracted !== undefined ? dataToSave.expectedResultExtracted : dataToSave.phaseI_BugReport?.toolInfo?.expectedResult,
      "phaseI_BugReport.toolInfo.actualResult": dataToSave.actualResultExtracted !== undefined ? dataToSave.actualResultExtracted : dataToSave.phaseI_BugReport?.toolInfo?.actualResult,
      "phaseI_BugReport.assignedTester": dataToSave.testerExtracted !== undefined ? dataToSave.testerExtracted : (dataToSave.phaseI_BugReport?.assignedTester?._id || dataToSave.phaseI_BugReport?.assignedTester?.id || dataToSave.phaseI_BugReport?.assignedTester),
      "phaseII_BugConfirmation.testingInfo.status": dataToSave.statusExtracted !== undefined ? dataToSave.statusExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.status,
      "phaseII_BugConfirmation.testingInfo.sopFollowed": dataToSave.sopFollowedExtracted !== undefined ? dataToSave.sopFollowedExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.sopFollowed,
      "phaseII_BugConfirmation.testingInfo.remarks": dataToSave.remarksExtracted !== undefined ? dataToSave.remarksExtracted : dataToSave.phaseII_BugConfirmation?.testingInfo?.remarks,
      "phaseII_BugConfirmation.assignedDeveloper": dataToSave.devExtracted !== undefined ? dataToSave.devExtracted : fallbackDevId,
      "phaseIII_BugAnalysis.analysisInfo.remarks": dataToSave.analyzeRemarkExtracted !== undefined ? dataToSave.analyzeRemarkExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.remarks,
      "phaseIII_BugAnalysis.analysisInfo.sopProvided": dataToSave.sopSolutionExtracted !== undefined ? dataToSave.sopSolutionExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.sopProvided,
      "phaseIII_BugAnalysis.analysisInfo.delayedReason": dataToSave.delayedReasonExtracted !== undefined ? dataToSave.delayedReasonExtracted : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.delayedReason,
      "phaseIV_Maintenance.maintenanceInfo.testingFlag": dataToSave.testingFlagExtracted !== undefined ? dataToSave.testingFlagExtracted : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.testingFlag,
      "phaseIV_Maintenance.maintenanceInfo.remarks": dataToSave.maintenanceRemarkExtracted !== undefined ? dataToSave.maintenanceRemarkExtracted : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.remarks,
      "phaseIV_Maintenance.maintenanceInfo.sopProvided": dataToSave.maintenanceSopExtracted !== undefined ? dataToSave.maintenanceSopExtracted : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.sopProvided,
      "phaseV_FinalTesting.testingInfo.remarks": dataToSave.finalTestingRemarkExtracted !== undefined ? dataToSave.finalTestingRemarkExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.remarks,
      "phaseV_FinalTesting.testingInfo.deploymentStatus": dataToSave.deploymentStatusExtracted !== undefined ? dataToSave.deploymentStatusExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.deploymentStatus,
      "phaseV_FinalTesting.testingInfo.deployRemark": dataToSave.deployRemarkExtracted !== undefined ? dataToSave.deployRemarkExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.deployRemark,
      "phaseV_FinalTesting.testingInfo.finalSop": dataToSave.finalSopExtracted !== undefined ? dataToSave.finalSopExtracted : dataToSave.phaseV_FinalTesting?.testingInfo?.finalSop,
      
      // Attachments for all phases
      "phaseI_BugReport.toolInfo.attachments": dataToSave.attachmentsExtracted !== undefined ? dataToSave.attachmentsExtracted.map(f => ({ url: f.url, fileName: f.name || f.fileName, uploadedAt: f.uploadedAt || new Date() })) : dataToSave.phaseI_BugReport?.toolInfo?.attachments,
      "phaseII_BugConfirmation.testingInfo.attachments": dataToSave.testingAttachmentsExtracted !== undefined ? dataToSave.testingAttachmentsExtracted.map(f => ({ url: f.url, fileName: f.name || f.fileName, uploadedAt: f.uploadedAt || new Date() })) : dataToSave.phaseII_BugConfirmation?.testingInfo?.attachments,
      "phaseIII_BugAnalysis.analysisInfo.attachments": dataToSave.analyzeAttachmentsExtracted !== undefined ? dataToSave.analyzeAttachmentsExtracted.map(f => ({ url: f.url, fileName: f.name || f.fileName, uploadedAt: f.uploadedAt || new Date() })) : dataToSave.phaseIII_BugAnalysis?.analysisInfo?.attachments,
    };

    if (dataToSave.currentPhaseExtracted) {
      updatePayload.currentPhase = dataToSave.currentPhaseExtracted;
      updatePayload.bugPhaseNo = dataToSave.bugPhaseNoExtracted;
      
      const bugToUpdate = phaseBugs.find(b => (b.id || b._id) === id);
      if (bugToUpdate?.currentPhase === "Bug Testing" && dataToSave.currentPhaseExtracted === "Bug Analysis") {
         updatePayload["phaseII_BugConfirmation.testedAt"] = new Date().toISOString();
      }

      // Automatically set "Go back to dev" flag if moving from RTT/Maintenance to Analysis
      if ((bugToUpdate?.currentPhase === "Ready to Test" || bugToUpdate?.currentPhase === "Maintenance") && 
          dataToSave.currentPhaseExtracted === "Bug Analysis") {
         updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] = "Go back to dev";
      }

      // Automatically set "Done" deployment status if moving to Closure
      if (dataToSave.currentPhaseExtracted === "Closure") {
         updatePayload["phaseV_FinalTesting.testingInfo.deploymentStatus"] = "Done";
      }

      // Automatically capture "Bug Analysed" if moving out of Analysis
      if (bugToUpdate?.currentPhase === "Bug Analysis" && 
          dataToSave.currentPhaseExtracted && 
          dataToSave.currentPhaseExtracted !== "Bug Analysis") {
         if (!bugToUpdate.phaseIII_BugAnalysis?.analyzedAt) {
            updatePayload["phaseIII_BugAnalysis.analyzedAt"] = new Date().toISOString();
         }
      }
    }

    // Auto-transition phase based on Testing Flag if in "Ready to Test" phase
    const currentBug = phaseBugs.find(b => (b.id || b._id) === id);
    if (currentBug?.currentPhase === "Ready to Test" && dataToSave.testingFlagExtracted) {
        if (dataToSave.testingFlagExtracted === "Go back to dev") {
            updatePayload.currentPhase = "Maintenance";
            updatePayload.bugPhaseNo = 4;
        } else if (dataToSave.testingFlagExtracted === "Ready for rollout") {
            updatePayload.currentPhase = "Ready to Deploy";
            updatePayload.bugPhaseNo = 6;
        }
    }

    const finalTestingFlag = updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] !== undefined ? updatePayload["phaseIV_Maintenance.maintenanceInfo.testingFlag"] : dataToSave.phaseIV_Maintenance?.maintenanceInfo?.testingFlag;
    
    try {
      const bugToUpdate = phaseBugs.find(b => (b.id || b._id) === id);
      const isTransitioningToTesting = bugToUpdate?.currentPhase === "Bug Reported" && updatePayload.currentPhase === "Bug Testing";
      const isTransitioningToAnalysis = bugToUpdate?.currentPhase === "Bug Testing" && updatePayload.currentPhase === "Bug Analysis";
      
      const res = await updateBug({ id, ...updatePayload });

      if (isTransitioningToTesting || isTransitioningToAnalysis) {
        const tName = updatePayload["phaseI_BugReport.toolInfo.toolName"] || bugToUpdate.phaseI_BugReport?.toolInfo?.toolName || "-";
        const priority = updatePayload["phaseI_BugReport.toolInfo.priority"] || bugToUpdate.phaseI_BugReport?.toolInfo?.priority || "low";
        const rName = bugToUpdate.phaseI_BugReport?.reportedBy?.name || "Unknown";
        const bId = bugToUpdate.bugId || "N/A";
        
        // Determine assigned person
        let assignedName = "Unknown";
        if (isTransitioningToTesting) {
          const testerId = updatePayload["phaseI_BugReport.assignedTester"];
          assignedName = allUsers?.find(u => (u.id || u._id) === testerId)?.name || "Unassigned";
        } else {
          const devId = updatePayload["phaseII_BugConfirmation.assignedDeveloper"];
          assignedName = allUsers?.find(u => (u.id || u._id) === devId)?.name || "Unassigned";
        }

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-5' : 'animate-out fade-out'} max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-gray-100 overflow-hidden z-[9999]`}>
            <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Assignment Alert</span>
               </div>
               <span className="text-xs font-bold text-gray-400">{bId}</span>
            </div>
            <div className="p-4 flex flex-col">
               <h4 className="text-sm font-black text-gray-900 leading-tight">
                 Bug {bId} Assigned to <span className="text-cyan-600">{assignedName}</span>
               </h4>
               <div className="flex items-center gap-2 mt-2">
                 <span className="text-xs font-bold text-gray-700 truncate max-w-[120px]">{tName}</span>
                 <span className="w-1 h-1 rounded-full bg-gray-300" />
                 <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase ${
                    priority === 'critical' ? 'bg-red-50 text-red-600' :
                    priority === 'high' ? 'bg-orange-50 text-orange-600' :
                    'bg-emerald-50 text-emerald-600'
                 }`}>
                   {priority}
                 </span>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50">
                 <div className="flex flex-col">
                   <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Reported By</span>
                   <span className="text-[11px] text-gray-600 font-black truncate">{rName}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Assigned To</span>
                   <span className="text-[11px] text-cyan-600 font-black truncate">{assignedName}</span>
                 </div>
               </div>
            </div>
          </div>
        ), { duration: 6000 });
      } else {
        toast.success("Bug updated successfully!");
      }
      setBugsList((prev) =>
        prev.map((bug) => {
          if (bug._id === id) {
             const newBug = {...bug};
             newBug.phaseI_BugReport.toolInfo.toolName = updatePayload["phaseI_BugReport.toolInfo.toolName"];
             if (updatePayload["phaseI_BugReport.toolInfo.toolId"]) {
               newBug.phaseI_BugReport.toolInfo.toolId = updatePayload["phaseI_BugReport.toolInfo.toolId"];
             }
             newBug.phaseI_BugReport.toolInfo.priority = updatePayload["phaseI_BugReport.toolInfo.priority"];
             newBug.phaseI_BugReport.toolInfo.stack = updatePayload["phaseI_BugReport.toolInfo.stack"];
             newBug.phaseI_BugReport.toolInfo.bugDescription = updatePayload["phaseI_BugReport.toolInfo.bugDescription"];
             newBug.phaseI_BugReport.toolInfo.expectedResult = updatePayload["phaseI_BugReport.toolInfo.expectedResult"];
             newBug.phaseI_BugReport.toolInfo.actualResult = updatePayload["phaseI_BugReport.toolInfo.actualResult"];
             newBug.phaseI_BugReport.toolInfo.attachments = updatePayload["phaseI_BugReport.toolInfo.attachments"];
             // Sync assignedTester
             if (updatePayload["phaseI_BugReport.assignedTester"] !== undefined) {
               const testerId = updatePayload["phaseI_BugReport.assignedTester"];
               const matchedTester = allUsers?.find(u => u.id === testerId || u._id === testerId);
               newBug.phaseI_BugReport.assignedTester = matchedTester
                 ? { _id: matchedTester._id || matchedTester.id, name: matchedTester.name, email: matchedTester.email }
                 : testerId;
             }
             
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
             if (updatePayload["phaseII_BugConfirmation.testingInfo.attachments"] !== undefined) {
                 newBug.phaseII_BugConfirmation.testingInfo.attachments = updatePayload["phaseII_BugConfirmation.testingInfo.attachments"];
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
             if (updatePayload["phaseIII_BugAnalysis.analysisInfo.attachments"] !== undefined) {
                 newBug.phaseIII_BugAnalysis.analysisInfo.attachments = updatePayload["phaseIII_BugAnalysis.analysisInfo.attachments"];
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
             if (updatePayload["phaseIV_Maintenance.maintenanceInfo.sopProvided"] !== undefined) {
                 newBug.phaseIV_Maintenance.maintenanceInfo.sopProvided = updatePayload["phaseIV_Maintenance.maintenanceInfo.sopProvided"];
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
    if (developerObj && (typeof developerObj !== "object" || !developerObj.name)) {
        const idToCheck = typeof developerObj === "object" ? (developerObj._id || developerObj.id) : developerObj;
        const found = allUsers?.find(u => (u.id || u._id) === idToCheck);
        if (found) developerObj = found;
    }
    if (isEditing && displayData.devExtracted) {
        developerObj = allUsers?.find(u => (u.id || u._id) === displayData.devExtracted);
    }
    const developer = developerObj?.name || (typeof developerObj === "string" ? developerObj : "");
    const developerEmail = developerObj?.email || "No email provided";
    
    // New testing fields
    const bugStatusOptions = ["No Bug", "Minor Bugs", "Error Unlocatted", "Actual Issue", "Resolved"];
    const bugStatus = displayData.statusExtracted ?? rawItem.phaseII_BugConfirmation?.testingInfo?.status ?? "-";
    
    const sopFollowedArr = displayData.sopFollowedExtracted !== undefined ? displayData.sopFollowedExtracted : rawItem.phaseII_BugConfirmation?.testingInfo?.sopFollowed;
    const sopFollowedStr = displayData.sopFollowedRaw !== undefined 
      ? displayData.sopFollowedRaw 
      : (sopFollowedArr && Array.isArray(sopFollowedArr) && sopFollowedArr.length > 0 ? sopFollowedArr.join(', ') : '');
    
    const remarks = displayData.remarksExtracted !== undefined ? displayData.remarksExtracted : rawItem.phaseII_BugConfirmation?.testingInfo?.remarks || "";

    // New analysis fields
    const analyzeRemark = displayData.analyzeRemarkExtracted !== undefined ? displayData.analyzeRemarkExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.remarks || "";
    
    const sopSolutionArr = displayData.sopSolutionExtracted !== undefined ? displayData.sopSolutionExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.sopProvided;
    const sopSolutionStr = displayData.sopSolutionRaw !== undefined 
      ? displayData.sopSolutionRaw 
      : (sopSolutionArr && Array.isArray(sopSolutionArr) && sopSolutionArr.length > 0 ? sopSolutionArr.join(', ') : '');
    
    const delayedReason = displayData.delayedReasonExtracted !== undefined ? displayData.delayedReasonExtracted : rawItem.phaseIII_BugAnalysis?.analysisInfo?.delayedReason || "";
    
    const maintenanceRemark = displayData.maintenanceRemarkExtracted !== undefined ? displayData.maintenanceRemarkExtracted : rawItem.phaseIV_Maintenance?.maintenanceInfo?.remarks || "";

    const maintenanceSopArr = displayData.maintenanceSopExtracted !== undefined ? displayData.maintenanceSopExtracted : rawItem.phaseIV_Maintenance?.maintenanceInfo?.sopProvided;
    const maintenanceSopStr = displayData.maintenanceSopRaw !== undefined 
      ? displayData.maintenanceSopRaw 
      : (maintenanceSopArr && Array.isArray(maintenanceSopArr) && maintenanceSopArr.length > 0 ? maintenanceSopArr.join(', ') : '');
    
    if (col.key === "bugId") {
       return (
         <CellTooltip content={`Click to view details for ${rawItem.bugId}`}>
           <span className="font-medium text-cyan-600 cursor-pointer" onClick={() => onClickCardToModal(rawItem)}>
             {rawItem.bugId || "N/A"}
           </span>
         </CellTooltip>
       );
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

    if (col.key === "bugAnalysedDate") {
        return <span className="text-gray-500 whitespace-nowrap">
          {rawItem.phaseIII_BugAnalysis?.analyzedAt ? new Date(rawItem.phaseIII_BugAnalysis.analyzedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : "-"}
        </span>;
    }

    if (col.key === "toolName") {
      if (isEditing) {
        // Build dropdown from the global tool list
        const toolsForDropdown = toolList || [];
        const selectedToolId  = displayData.toolIdExtracted ?? rawItem.phaseI_BugReport?.toolInfo?.toolId;
        const selectedToolLabel = toolsForDropdown.find(t => (t.id || t._id) === selectedToolId)?.name || toolName;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
                <span className="truncate">{selectedToolLabel}</span>
                <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 max-h-52 overflow-auto z-50">
              {toolsForDropdown.map((tool) => (
                <DropdownMenuItem
                  key={tool.id || tool._id}
                  className="text-xs py-1.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRowEditData({
                      toolNameExtracted: tool.name,
                      toolIdExtracted: tool.id || tool._id,
                      // Clear stale stack so relative options are re-evaluated
                      stackExtracted: undefined,
                    });
                  }}
                >
                  {tool.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return (
        <CellTooltip content={toolName}>
          <span className="font-medium text-gray-900 truncate block">{toolName}</span>
        </CellTooltip>
      );
    }

    if (col.key === "bugRaiser") {
      return (
        <CellTooltip content={`${raiser} (${raiserEmail})`}>
          <span className="text-gray-600 truncate block w-full">{raiser}</span>
        </CellTooltip>
      );
    }

    if (col.type === "facedByCard") {
      const clientCtx = rawItem.phaseI_BugReport?.clientContext;
      if (!clientCtx) return <span className="text-gray-400">-</span>;

      if (clientCtx.facedByMe) {
        return (
          <CellTooltip content="Issue faced by the raiser themselves">
            <span className="text-gray-700 font-medium">Me</span>
          </CellTooltip>
        );
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
        <CellTooltip content={followedItems.join('\n')}>
          <ul className="list-disc pl-5 text-xs text-gray-700 m-0 max-h-20 overflow-y-auto block w-full pr-1">
            {followedItems.map((item, idx) => (
               <li key={idx} className="truncate">{item}</li>
            ))}
          </ul>
        </CellTooltip>
      );
    }

    if (col.key === "assignedTester") {
      if (isEditing) {
        const testers = allUsers?.filter(u =>
          Array.isArray(u.roletype) ? u.roletype.includes("tester") : u.roletype === "tester"
        ) || [];

        let selectedTesterId = displayData.testerExtracted ?? testerObj?._id ?? testerObj?.id;
        const selectedTesterLabel = testers.find(t => (t.id || t._id) === selectedTesterId)?.name
          || tester
          || "Select Tester";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-start text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
                <span className="truncate">{selectedTesterLabel}</span>
                <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 max-h-48 overflow-auto z-50">
              {testers.map((t) => (
                <DropdownMenuItem
                  key={t.id || t._id}
                  className="text-xs py-1.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRowEditData({ testerExtracted: t.id || t._id });
                  }}
                >
                  {t.name || t.username || t.email}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      return (
        <CellTooltip content={`${tester} (${testerEmail})`}>
          <span className="text-gray-600 truncate block w-full">{tester}</span>
        </CellTooltip>
      );
    }

    if (col.key === "assignedDev") {
      if (isEditing && col.type === "devSelect") {
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
        return (
          <CellTooltip content={developerEmail}>
            <span className="text-gray-600 truncate block w-full">{developer || "-"}</span>
          </CellTooltip>
        );
      }
    }

    if (col.key === "attachments" || col.type === "attachment") {
      const attachments = displayData.attachmentsExtracted || rawItem.phaseI_BugReport?.toolInfo?.attachments || [];
      return (
        <AttachmentGallery 
          files={attachments}
          isEditable={isEditing}
          onUpdate={(newFiles) => setRowEditData({ attachmentsExtracted: newFiles })}
          label="Bug Attachments"
        />
      );
    }
    
    if (col.key === "testingAttachment" || col.type === "testingAttachment") {
      const attachments = displayData.testingAttachmentsExtracted || rawItem.phaseII_BugConfirmation?.testingInfo?.attachments || [];
      return (
        <AttachmentGallery 
          files={attachments}
          isEditable={isEditing}
          onUpdate={(newFiles) => setRowEditData({ testingAttachmentsExtracted: newFiles })}
          label="Testing Attachments"
        />
      );
    }
    
    if (col.key === "analyzeAttachment" || col.type === "analyzeAttachment") {
      const attachments = displayData.analyzeAttachmentsExtracted || rawItem.phaseIII_BugAnalysis?.analysisInfo?.attachments || [];
      return (
        <AttachmentGallery 
          files={attachments}
          isEditable={isEditing}
          onUpdate={(newFiles) => setRowEditData({ analyzeAttachmentsExtracted: newFiles })}
          label="Analysis Attachments"
        />
      );
    }
    
    if (col.type === "analyzeRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y" rows={2} placeholder="Add Root Cause..." value={analyzeRemark} onChange={(e) => setRowEditData({ analyzeRemarkExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={analyzeRemark !== "-" ? analyzeRemark : ""}>
           <span className="text-gray-600 truncate block w-full">{analyzeRemark || "-"}</span>
         </CellTooltip>
       );
    }
    
    if (col.type === "delayedReasonText") {
       if (isEditing) {
          return (
             <Input className="h-8 w-full text-xs" placeholder="Delayed Reason..." value={delayedReason} onChange={(e) => setRowEditData({ delayedReasonExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={delayedReason !== "-" ? delayedReason : ""}>
           <span className="text-gray-600 truncate block w-full">{delayedReason || "-"}</span>
         </CellTooltip>
       );
    }
    
    if (col.type === "sopSolutionText") {
      if (isEditing) {
        return (
          <textarea 
            className="w-full text-xs border rounded p-1 resize-y" 
            rows={2}
            placeholder="SOP for solution (comma separated)"
            value={sopSolutionStr}
            onChange={(e) => {
              const raw = e.target.value;
              const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
              setRowEditData({ 
                sopSolutionExtracted: arr,
                sopSolutionRaw: raw 
              });
            }}
          />
        );
      } else {
        return (
          <CellTooltip content={sopSolutionStr !== "-" ? sopSolutionStr : ""}>
            <span className="text-gray-600 text-xs truncate block w-full">{sopSolutionStr || "-"}</span>
          </CellTooltip>
        );
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
       return (
         <CellTooltip content={remarks !== "-" ? remarks : ""}>
           <span className="text-gray-600 truncate block w-full">{remarks || "-"}</span>
         </CellTooltip>
       );
    }

    if (col.type === "maintenanceRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y bg-pink-50/30" rows={2} placeholder="Add Maintenance Remarks..." value={maintenanceRemark} onChange={(e) => setRowEditData({ maintenanceRemarkExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={maintenanceRemark !== "-" ? maintenanceRemark : ""}>
           <span className="text-gray-600 truncate block w-full">{maintenanceRemark || "-"}</span>
         </CellTooltip>
       );
    }

    if (col.type === "maintenanceSopText") {
      if (isEditing) {
        return (
          <textarea 
            className="w-full text-xs border rounded p-1 resize-y bg-pink-50/30" 
            rows={2}
            placeholder="Maintenance SOP (comma separated)"
            value={maintenanceSopStr}
            onChange={(e) => {
              const raw = e.target.value;
              const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
              setRowEditData({ 
                maintenanceSopExtracted: arr,
                maintenanceSopRaw: raw 
              });
            }}
          />
        );
      } else {
        return (
          <CellTooltip content={maintenanceSopStr !== "-" ? maintenanceSopStr : ""}>
            <span className="text-gray-600 text-xs truncate block w-full">{maintenanceSopStr || "-"}</span>
          </CellTooltip>
        );
      }
    }

    const finalTestingRemark = displayData.finalTestingRemarkExtracted !== undefined ? displayData.finalTestingRemarkExtracted : rawItem.phaseV_FinalTesting?.testingInfo?.remarks || "";

    if (col.type === "finalTestingRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y" rows={2} placeholder="Add Final Testing Remarks..." value={finalTestingRemark} onChange={(e) => setRowEditData({ finalTestingRemarkExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={finalTestingRemark !== "-" ? finalTestingRemark : ""}>
           <span className="text-gray-600 truncate block w-full">{finalTestingRemark || "-"}</span>
         </CellTooltip>
       );
    }

    const deployRemark = displayData.deployRemarkExtracted !== undefined ? displayData.deployRemarkExtracted : rawItem.phaseV_FinalTesting?.testingInfo?.deployRemark || "";
    if (col.type === "deployRemarkText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y bg-emerald-50/30" rows={2} placeholder="Add Deploy Remarks..." value={deployRemark} onChange={(e) => setRowEditData({ deployRemarkExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={deployRemark || ""}>
           <span className="text-gray-600 truncate block w-full">{deployRemark || "-"}</span>
         </CellTooltip>
       );
    }

    const finalSop = displayData.finalSopExtracted !== undefined ? displayData.finalSopExtracted : rawItem.phaseV_FinalTesting?.testingInfo?.finalSop || "";
    if (col.type === "finalSopText") {
       if (isEditing) {
          return (
            <textarea className="w-full text-xs border rounded p-1 resize-y bg-emerald-50/30" rows={2} placeholder="Add Final SOP..." value={finalSop} onChange={(e) => setRowEditData({ finalSopExtracted: e.target.value })} />
          );
       }
       return (
         <CellTooltip content={finalSop || ""}>
           <span className="text-gray-600 truncate block w-full">{finalSop || "-"}</span>
         </CellTooltip>
       );
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
          <textarea 
            className="w-full text-xs border rounded p-1 resize-y" 
            rows={2}
            placeholder="SOP Followed (comma separated)"
            value={sopFollowedStr}
            onChange={(e) => {
              const raw = e.target.value;
              const arr = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
              setRowEditData({ 
                sopFollowedExtracted: arr,
                sopFollowedRaw: raw
              });
            }}
          />
        );
      } else {
        return (
          <CellTooltip content={sopFollowedStr !== "-" ? sopFollowedStr : ""}>
            <span className="text-gray-600 text-xs truncate block w-full">{sopFollowedStr || "-"}</span>
          </CellTooltip>
        );
      }
    }

    if (col.key === "rootCause") {
       const rootCause = rawItem.phaseIII_BugAnalysis?.analysisInfo?.rootCause || "-";
       return (
         <CellTooltip content={rootCause}>
           <span className="text-gray-600 truncate block w-full">{rootCause}</span>
         </CellTooltip>
       );
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
            <CellTooltip content={`Expected: ${expRes}\n\nActual: ${actRes}`}>
              <div className={`text-[14px] text-gray-700 whitespace-pre-wrap ${maxLines} overflow-hidden`}>
                <span className="font-semibold text-gray-900">Expected:</span> {expRes}
                <br/><br/>
                <span className="font-semibold text-gray-900">Actual:</span> {actRes}
              </div>
            </CellTooltip>
          );
        } else {
          return (
            <CellTooltip content={bugDesc}>
              <div className="text-[14px] text-gray-700 whitespace-pre-wrap line-clamp-4 overflow-hidden">
                {bugDesc}
              </div>
            </CellTooltip>
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
      // Determine which tool is selected (from edit data or from saved bug)
      const activeToolId = displayData.toolIdExtracted ?? rawItem.phaseI_BugReport?.toolInfo?.toolId;
      const activeTool   = toolList?.find(t => (t.id || t._id) === activeToolId);
      const toolStacks   = activeTool && Array.isArray(activeTool.stack) && activeTool.stack.length > 0
        ? activeTool.stack
        : stackOptions; // fallback to global defaults

      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start text-left">
               {stack}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            {toolStacks.map((opt) => (
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
        <span className="text-gray-600" title={stack}>{stack}</span>
      );
    }

    if (col.type === "phaseSelect") {
      const currentPhaseName = displayData.currentPhaseExtracted || rawItem.currentPhase || "-";
      const allAvailablePhases = [
        { label: "Bug Testing", value: "testing", phaseNo: 2 },
        { label: "Bug Analysis", value: "analyze", phaseNo: 3 },
        { label: "Maintenance", value: "maintenance", phaseNo: 4 },
        { label: "Ready to Test", value: "rtt", phaseNo: 5 },
        { label: "Ready to Deploy", value: "rtd", phaseNo: 6 },
        { label: "Closure", value: "deployed", phaseNo: 7 }
      ];

      // Logic: If in "Ready to Test", only allow going back to Maintenance or forward to Ready to Deploy
      let filteredPhases = allAvailablePhases;
      if (rawItem.currentPhase === "Ready to Test") {
        filteredPhases = allAvailablePhases.filter(p => 
          p.label === "Maintenance" || p.label === "Ready to Test" || p.label === "Ready to Deploy"
        );
      } else if (rawItem.currentPhase === "Maintenance") {
        // Logic: If in "Maintenance", only allow going back to Bug Analysis or forward to Ready to Test
        filteredPhases = allAvailablePhases.filter(p => 
          p.label === "Bug Analysis" || p.label === "Ready to Test"
        );
      } else if (rawItem.currentPhase === "Ready to Deploy") {
        // Logic: If in "Ready to Deploy", allow going back to Ready to Test or forward to Closure
        filteredPhases = allAvailablePhases.filter(p => 
          p.label === "Ready to Test" || p.label === "Closure"
        );
      } else {
        // General rule: don't show the current phase in the dropdown (optional, but cleaner)
        filteredPhases = allAvailablePhases.filter(p => p.label !== rawItem.currentPhase);
      }

      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-between text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
               <span className="truncate">{currentPhaseName}</span>
               <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 z-50">
            {filteredPhases.map((opt) => (
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
        <span className="text-gray-600 truncate block w-full" title={`Phase: ${currentPhaseName}`}>{currentPhaseName}</span>
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
                  <DropdownMenuItem key={opt} onClick={() => {
                      const updateObj = { testingFlagExtracted: opt };
                      if (opt === "Go back to dev") {
                        updateObj.currentPhaseExtracted = "Maintenance";
                        updateObj.bugPhaseNoExtracted = 4;
                      } else if (opt === "Ready for rollout") {
                        updateObj.currentPhaseExtracted = "Ready to Deploy";
                        updateObj.bugPhaseNoExtracted = 6;
                      }
                      setRowEditData(updateObj);
                   }} className="cursor-pointer">
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
            <TableRow className="hover:bg-transparent h-14">
              <TableHead className="p-0 sticky left-0 top-0 z-40 bg-white shadow-[2px_0_2px_-2px_#eee]" style={{ width: colWidths.checkbox || 48, minWidth: 48, maxWidth: 120 }}>
                <div className="flex items-center justify-center h-14 w-full">
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
                </div>
              </TableHead>

              {tableDetails.map((col) => {
                const isPinned = pinnedColumns.includes(col.key);
                const pinStyle = getPinnedStyle(col.key);
                const isPhase2Target = ['testing', 'analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['bugStatus', 'sopFollowed', 'remarks', 'testingAttachment', 'assignedDev'].includes(col.key);
                const isPhase3Target = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['analyzeRemark', 'sopForSolution', 'delayedReason', 'analyzeAttachment'].includes(col.key);
                const isPhaseMaintenanceTarget = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['maintenanceRemark', 'maintenanceSOP'].includes(col.key);
                const isPhase4Target = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['testingFlag', 'finalTestingRemark'].includes(col.key);
                const isPhase5Target = ['rtd'].includes(phaseId) && ['deploymentStatus', 'deployRemark', 'finalSop'].includes(col.key);
                
                let textColor = "";
                let bgActiveColor = "white";
                
                if (isPhase5Target) {
                    textColor = "text-[#059669]"; // emerald-600
                    bgActiveColor = "#ecfdf5";    // emerald-50
                } else if (isPhaseMaintenanceTarget) {
                    textColor = "text-[#db2777]"; // pink-600
                    bgActiveColor = "#fdf2f8";    // pink-50
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
                <TableHead key={col.key} className={`sticky top-0 ${textColor} border-b border-gray-100 shadow-[2px_0_2px_-2px_#eee]`} style={{ ...pinStyle, width: colWidths[col.key], minWidth: 60, maxWidth: 600, zIndex: isPinned ? 50 : 30, backgroundColor: isPinned ? '#fff' : bgActiveColor }}>
                  <ResizableHeader columnKey={col.key} colWidths={colWidths} setColWidths={setColWidths}>
                    <ColumnHeader columnKey={col.key} onPin={handlePinColumn} isPinned={isPinned}>
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
                );
              })}
              <TableHead className="sticky right-0 top-0 bg-white shadow-[-2px_0_2px_-2px_#eee]" style={{ width: 120, minWidth: 60, maxWidth: 600, zIndex: 40 }}>
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
                    onEdit={() => isRowEditable(item) ? handleEdit(item) : null}
                    onDelete={() => handleDeleteSingle(item._id)}
                    onSaveAll={handleSaveAll}
                    onEditSelected={handleEditSelected}
                    onDeleteSelected={handleDeleteSelected}
                    onCancelAll={handleCancelAll}
                  >
                    <TableRow className="group cursor-pointer hover:bg-slate-50 transition-colors">
                      <TableCell className="p-0 sticky left-0 z-20 !bg-white group-hover:!bg-slate-50 transition-colors border-r border-gray-100" style={{ width: colWidths.checkbox || 48, minWidth: 48, maxWidth: 120 }}>
                        <div className="flex items-center justify-center h-full min-h-[64px] w-full">
                          <Checkbox checked={selectedRows.includes(item._id)} onCheckedChange={() => handleRowSelect(item._id)} />
                        </div>
                      </TableCell>
                      
                      {tableDetails.map((col) => {
                        const isPhase2Target = ['testing', 'analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['bugStatus', 'sopFollowed', 'remarks', 'testingAttachment', 'assignedDev'].includes(col.key);
                        const isPhase3Target = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['analyzeRemark', 'sopForSolution', 'delayedReason', 'analyzeAttachment'].includes(col.key);
                        const isPhaseMaintenanceTarget = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['maintenanceRemark', 'maintenanceSOP'].includes(col.key);
                        const isPhase4Target = ['analyze', 'maintenance', 'rtt', 'reanalyze', 'rtd'].includes(phaseId) && ['testingFlag', 'finalTestingRemark'].includes(col.key);
                        const isPhase5Target = ['rtd'].includes(phaseId) && ['deploymentStatus', 'deployRemark', 'finalSop'].includes(col.key);

                        let cellBg = undefined;
                        if (isPhase5Target) {
                            cellBg = "bg-emerald-50/30";
                        } else if (isPhaseMaintenanceTarget) {
                            cellBg = "#fdf2f8";
                        } else if (isPhase4Target) {
                            cellBg = "#fffbeb";
                        } else if (isPhase3Target) {
                            cellBg = "#f5f3ff";
                        } else if (isPhase2Target) {
                            cellBg = "#eef2ff";
                        }

                        // if column is pinned, override background to white so hover doesn't break, unless it's a phase target but testing phase target won't be pinned usually.
                        // Respect editableColumnKeys restriction AND current phase restriction.
                        const colIsEditable = isColEditable(col.key, item, editableColumnKeys);
                        const effectiveIsEditing = isEditing && colIsEditable;
                        
                        const isPinned = pinnedColumns.includes(col.key);
                        const pinnedClasses = isPinned ? "!bg-white group-hover:!bg-slate-50 transition-colors" : "";

                        // Visual cue for locked columns when row is in edit mode
                        // We avoid 'opacity' on sticky columns to prevent transparency issues
                        const lockedStyle = isEditing && !colIsEditable
                          ? { backgroundColor: isPinned ? "#f1f5f9" : "#f8fafc", color: "#94a3b8" } 
                          : {};

                        return (
                        <TableCell 
                          key={col.key} 
                          style={{ 
                            ...getPinnedStyle(col.key), 
                            width: colWidths[col.key], 
                            minWidth: 60, 
                            maxWidth: 600, 
                            backgroundColor: !isPinned ? cellBg : undefined, 
                            zIndex: isPinned ? 20 : 1,
                            ...lockedStyle 
                          }}
                          className={`${pinnedClasses} ${isPinned ? 'border-r border-gray-100' : ''}`}
                        >
                          {renderCell(col, item, effectiveIsEditing, displayData, (val) =>
                            setEditData((prev) => ({
                              ...prev,
                              [item._id]: { ...(prev[item._id] || item), ...val },
                            }))
                          )}
                        </TableCell>
                        );
                      })}

                      <TableCell className="sticky right-0 !bg-white z-20 group-hover:!bg-slate-50 transition-colors shadow-[-2px_0_2px_-2px_#eee] border-l border-gray-100" style={{ width: 120, minWidth: 60, maxWidth: 600 }}>
                        <div className="flex items-center justify-center gap-1.5 py-1">
                          {isEditing ? (
                            <div className="flex gap-1 items-center">
                              <CellTooltip content="Save Changes">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => handleSave(item._id)} 
                                  className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </CellTooltip>
                              <CellTooltip content="Cancel">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => handleCancel(item._id)} 
                                  className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-slate-100"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </CellTooltip>
                            </div>
                          ) : (
                            <>
                              <CellTooltip content="Activity Log">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`/bugs/${item._id}/activity`, "_blank");
                                  }} 
                                  className="h-7 w-7 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                  <LibraryBig className="h-4 w-4" />
                                </Button>
                              </CellTooltip>
                              
                              {isRowEditable(item) ? (
                                <BugTableRowMenu onEdit={() => handleEdit(item)} />
                              ) : (
                                <span className="text-xs text-gray-300 select-none px-2">—</span>
                              )}
                            </>
                          )}
                        </div>
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
