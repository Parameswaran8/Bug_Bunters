import React, { useState, useRef } from "react";
import { ArrowUp, ArrowDown, Pin, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
    { key: "reportedDate", label: "Reported", type: "date", width: 140 },
    { key: "currentPhase", label: "Change Phase", type: "phaseSelect", width: 150 },
  ];
  
  if (phaseId === "create") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "platform", label: "Platform", type: "platformSelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "assignedTester", label: "Assigned Tester", type: "text", width: 150 },
      ...commonEnd
    ];
  }
  
  if (phaseId === "testing") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "assignedDev", label: "Assigned Dev", type: "text", width: 150 },
      { key: "attachments", label: "Attachment", type: "attachment", width: 100 },
      { key: "remarks", label: "Remarks", type: "text", width: 200 },
      ...commonEnd
    ];
  }

  if (phaseId === "analyze") {
    return [
      { key: "bugId", label: "Bug ID", type: "text", width: 140 },
      { key: "toolName", label: "Tool Name", type: "text", width: 180 },
      { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
      { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
      { key: "assignedTester", label: "Bug Tester", type: "text", width: 150 },
      { key: "rootCause", label: "Conclusion", type: "text", width: 200 },
      ...commonEnd
    ];
  }

  // Default fallback
  return [
    { key: "bugId", label: "Bug ID", type: "text", width: 140 },
    { key: "toolName", label: "Tool Name", type: "text", width: 180 },
    { key: "priority", label: "Priority", type: "prioritySelect", width: 120 },
    { key: "platform", label: "Platform", type: "platformSelect", width: 120 },
    { key: "bugRaiser", label: "Bug Raiser", type: "text", width: 150 },
    { key: "assignedTester", label: "Assigned Tester", type: "text", width: 150 },
    { key: "assignedDev", label: "Assigned Dev", type: "text", width: 150 },
    ...commonEnd
  ];
};

const priorityOptions = ["critical", "high", "medium", "low"];
const platformOptions = ["Web", "App", "Any"];

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
  const { bugsList, setBugsList } = useAuth();
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
    // In our backend schema for Priority/Platform, they live in phaseI_BugReport.toolInfo
    const updatePayload = {
      "phaseI_BugReport.toolInfo.toolName": dataToSave.toolNameExtracted || dataToSave.phaseI_BugReport?.toolInfo?.toolName,
      "phaseI_BugReport.toolInfo.priority": dataToSave.priorityExtracted || dataToSave.phaseI_BugReport?.toolInfo?.priority,
      "phaseI_BugReport.toolInfo.platform": dataToSave.platformExtracted || dataToSave.phaseI_BugReport?.toolInfo?.platform,
    };

    try {
      const res = await updateBug({ id, ...updatePayload }); // Mocking sending update params
      // Force instant frontend sync
      setBugsList((prev) =>
        prev.map((bug) => {
          if (bug._id === id) {
             const newBug = {...bug};
             newBug.phaseI_BugReport.toolInfo.toolName = updatePayload["phaseI_BugReport.toolInfo.toolName"];
             newBug.phaseI_BugReport.toolInfo.priority = updatePayload["phaseI_BugReport.toolInfo.priority"];
             newBug.phaseI_BugReport.toolInfo.platform = updatePayload["phaseI_BugReport.toolInfo.platform"];
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

  const handlePhaseChange = async (id, newPhaseStr, newPhaseNo) => {
    try {
      const res = await updateBug({ id, currentPhase: newPhaseStr, bugPhaseNo: newPhaseNo });
      if (res.success || res.message === "Bug updated successfully") {
        setBugsList((prev) =>
          prev.map((bug) => {
            if (bug._id === id) {
               return { ...bug, currentPhase: newPhaseStr, bugPhaseNo: newPhaseNo };
            }
            return bug;
          })
        );
        toast.success(`Bug moved to ${newPhaseStr}`);
      } else {
        toast.error(res.message || "Failed to change phase");
      }
    } catch (error) {
      toast.error("Error changing phase");
    }
  };

  const renderCell = (col, rawItem, isEditing, displayData, setRowEditData) => {
    // Because data is nested deeply, we extract them virtually for editing
    const toolName = displayData.toolNameExtracted || rawItem.phaseI_BugReport?.toolInfo?.toolName || "-";
    const priority = displayData.priorityExtracted || rawItem.phaseI_BugReport?.toolInfo?.priority || "low";
    const platform = displayData.platformExtracted || rawItem.phaseI_BugReport?.toolInfo?.platform || "-";
    
    // User mappings - Add email handling
    const raiser = rawItem.phaseI_BugReport?.reportedBy?.name || "Unknown";
    const raiserEmail = rawItem.phaseI_BugReport?.reportedBy?.email || "No email provided";
    
    // Bug Tester uses assignedTester in Phase I, or testedBy in Phase II, default to assignedTester
    const testerObj = rawItem.phaseI_BugReport?.assignedTester || rawItem.phaseII_BugConfirmation?.testedBy;
    const tester = testerObj?.name || "Unassigned";
    const testerEmail = testerObj?.email || "No email provided";
    
    const developer = rawItem.phaseII_BugConfirmation?.assignedDeveloper?.name || "Unassigned";
    const developerEmail = rawItem.phaseII_BugConfirmation?.assignedDeveloper?.email || "No email provided";
    
    if (col.key === "bugId") {
       return <span className="font-medium text-cyan-600 cursor-pointer" onClick={() => onClickCardToModal(rawItem)}>{rawItem.bugId || "N/A"}</span>;
    }

    if (col.key === "reportedDate") {
        return <span className="text-gray-500 whitespace-nowrap">
          {rawItem.phaseI_BugReport?.reportedAt ? new Date(rawItem.phaseI_BugReport.reportedAt).toLocaleDateString() : "-"}
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

    if (col.key === "assignedTester") {
      return <span className="text-gray-600 truncate block w-full" title={testerEmail}>{tester}</span>;
    }

    if (col.key === "assignedDev") {
      return <span className="text-gray-600 truncate block w-full" title={developerEmail}>{developer}</span>;
    }

    if (col.key === "attachments") {
      const attachments = rawItem.phaseII_BugConfirmation?.testingInfo?.attachments;
      if (attachments && attachments.length > 0) {
        return (
           <a href={attachments[0].url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:text-cyan-800 underline text-sm whitespace-nowrap">
             View File
           </a>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
    
    if (col.key === "remarks") {
       const remarks = rawItem.phaseII_BugConfirmation?.testingInfo?.remarks || "-";
       return <span className="text-gray-600 truncate block w-full">{remarks}</span>;
    }

    if (col.key === "rootCause") {
       const rootCause = rawItem.phaseIII_BugAnalysis?.analysisInfo?.rootCause || "-";
       return <span className="text-gray-600 truncate block w-full">{rootCause}</span>;
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

    if (col.type === "platformSelect") {
      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-start text-left">
               {platform}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            {platformOptions.map((opt) => (
               <DropdownMenuCheckboxItem
                 key={opt}
                 checked={platform === opt}
                 onClick={() => setRowEditData({ platformExtracted: opt })}
               >
                 {opt}
               </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-gray-600">{platform}</span>
      );
    }

    if (col.type === "phaseSelect") {
      const currentPhase = rawItem.currentPhase || "-";
      const availablePhases = [
        { label: "Bug Confirmation", value: "testing", phaseNo: 2 },
        { label: "Bug Analysis", value: "analyze", phaseNo: 3 },
        { label: "Maintenance", value: "rtt", phaseNo: 4 },
        { label: "Final Testing", value: "rtd", phaseNo: 5 },
        { label: "Closure", value: "deployed", phaseNo: 6 }
      ];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-full justify-between text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
               <span className="truncate">{currentPhase}</span>
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
                   handlePhaseChange(rawItem._id, opt.label, opt.phaseNo);
                 }}
               >
                 {opt.label}
               </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      <div className="[&>div]:rounded-sm [&>div]:border overflow-x-auto overflow-y-auto h-[calc(100vh-360px)] mt-4 shadow-sm bg-white relative">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="p-0 flex items-center justify-center h-16 sticky left-0 z-30 bg-white shadow-[2px_0_2px_-2px_#eee]" style={{ width: colWidths.checkbox || 48, minWidth: 48, maxWidth: 120, top: 0 }}>
                {/* Fixed Checkbox header space */}
              </TableHead>
              {tableDetails.map((col) => {
                const isPinned = pinnedColumns.includes(col.key);
                const pinStyle = getPinnedStyle(col.key);
                return (
                <TableHead key={col.key} className="sticky" style={{ ...pinStyle, width: colWidths[col.key], minWidth: 60, maxWidth: 600, top: 0, zIndex: isPinned ? 30 : 20, backgroundColor: 'white' }}>
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
                      
                      {tableDetails.map((col) => (
                        <TableCell key={col.key} style={{ ...getPinnedStyle(col.key), width: colWidths[col.key], minWidth: 60, maxWidth: 600 }}>
                          {renderCell(col, item, isEditing, displayData, (val) =>
                            setEditData((prev) => ({
                              ...prev,
                              [item._id]: { ...(prev[item._id] || item), ...val },
                            }))
                          )}
                        </TableCell>
                      ))}

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
