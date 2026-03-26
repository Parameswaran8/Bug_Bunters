import React, { useState, useEffect, useRef } from "react";
import { Upload, ArrowUp, ArrowDown, Pin, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { updateTool } from "@/API_Call/Tool";
import { useAuth } from "@/context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableContextMenu from "../RightClickMenu";
import TableRowMenu from "../TableMenu";

const tableDetails = [
  { key: "toolName", label: "Tool Name", type: "text", width: 180 },
  { key: "toolDescription", label: "Description", type: "text", width: 220 },
  { key: "stack", label: "Stack", type: "text", width: 200 },
  { key: "testerId", label: "Responsible Tester", type: "userSelect", width: 180 },
  { key: "devId", label: "Responsible Dev", type: "userSelect", width: 180 },
  { key: "SOP", label: "SOP Document", type: "textarea", width: 220 },
  { key: "ReleaseNotes", label: "Release Notes", type: "textarea", width: 220 },
  { key: "libraryName", label: "Library Version", type: "text", width: 120 },
  { key: "htmlVersion", label: "HTML Version", type: "text", width: 120 },
];

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
    <div className="flex items-center group select-none" style={{ width: colWidths[columnKey], minWidth: 48 }}>
      <div className="flex-1">{children}</div>
      <div
        onMouseDown={handleMouseDown}
        className="w-4 h-6 cursor-col-resize ml-1 flex items-center justify-center text-gray-300 hover:text-gray-500"
      >
        |
      </div>
    </div>
  );
};

const ColumnHeader = ({ children, onPin, isPinned, columnKey }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer group">
          <span>{children}</span>
          {isPinned && <Pin className="w-4 h-4 text-blue-500" />}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onPin(columnKey)}>
          <Pin className="w-4 h-4 mr-2" />
          {isPinned ? "Unpin Column" : "Pin Column"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TableTool = ({ isOpen, setIsOpen }) => {
  const { toolList, setToolList, allUsers, user: authUser } = useAuth();
  const currentUser = allUsers?.find(u => u._id === authUser?.id || u.id === authUser?.id) || authUser;
  const canCreate = currentUser?.role === "superadmin" || currentUser?.adminControl?.includes("create");
  const canEdit = currentUser?.role === "superadmin" || currentUser?.adminControl?.includes("edit");
  const canDelete = currentUser?.role === "superadmin" || currentUser?.adminControl?.includes("delete");

  const [editingIds, setEditingIds] = useState([]);
  const [editData, setEditData] = useState({});
  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );
  const [selectedRows, setSelectedRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const totalPages = Math.max(1, Math.ceil((toolList?.length || 0) / rowsPerPage));
  const paginatedData = toolList ? toolList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : [];

  const handlePinColumn = (columnKey) => {
    setPinnedColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((col) => col !== columnKey) : [...prev, columnKey]
    );
  };

  const getPinnedStyle = (columnKey) => {
    if (!pinnedColumns.includes(columnKey) && columnKey !== "checkbox") return {};
    let left = colWidths.checkbox || 48;
    for (const col of tableDetails) {
      if (col.key === columnKey) break;
      if (pinnedColumns.includes(col.key)) {
        left += colWidths[col.key] || 160;
      }
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

  const handleSave = async (id) => {
    const updatingData = editData[id];
    if (!updatingData) return;

    // Convert stack back to array if modified as string
    if (typeof updatingData.stack === "string") {
      updatingData.stack = updatingData.stack.split(",").map(i => i.trim()).filter(Boolean);
    }
    
    // update to API
    const res = await updateTool({ ...updatingData, toolName: updatingData.toolName });
    if (res.success) {
      toast.success("Tool updated!");
      
      // Update global context cache instantly
      setToolList((prev) => 
        prev.map((t) => (t.id === id ? { ...t, ...updatingData } : t))
      );
      
      handleCancel(id);
    } else {
      toast.error("Update failed.");
    }
  };

  const handleCancel = (id) => {
    setEditingIds((prev) => prev.filter((eid) => eid !== id));
    setEditData((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const handleEditSelected = () => {
    if (selectedRows.length > 0) {
      setEditingIds(selectedRows);
      const newEditData = {};
      selectedRows.forEach((id) => {
        const item = toolList.find((i) => i.id === id || i._id === id);
        if (item) newEditData[id] = { ...item };
      });
      setEditData(newEditData);
    }
  };

  const handleDeleteSelected = async () => {
    setToolList(prev => prev.filter(it => !selectedRows.includes(it.id) && !selectedRows.includes(it._id)));
    setSelectedRows([]);
    toast.success("Selected tools deleted!");
  };

  const handleDeleteSingle = async (id) => {
    setToolList(prev => prev.filter(it => it.id !== id && it._id !== id));
    toast.success("Tool deleted!");
  };

  const handleSaveAll = async () => {
    for (const id of editingIds) {
      if (editData[id]) await handleSave(id);
    }
    setSelectedRows([]);
  };

  const handleCancelAll = () => {
    setEditingIds([]);
    setEditData({});
    setSelectedRows([]);
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const renderCell = (col, item, isEditing, displayData) => {
    if (col.type === "userSelect") {
      const currentUserId = displayData[col.key] || "";
      const currentObj = typeof currentUserId === "object" ? currentUserId : allUsers?.find(u => u.id === currentUserId || u._id === currentUserId);
      const displayVal = currentObj?.name || "Unassigned";

      if (isEditing) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 w-full justify-between text-left shrink-0 text-xs px-2" onClick={(e) => e.stopPropagation()}>
                 <span className="truncate">{displayVal}</span>
                 <ChevronDown className="ml-1 h-3 w-3 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 z-50 max-h-60 overflow-y-auto">
              <DropdownMenuItem
                 className="text-xs py-1.5 cursor-pointer"
                 onClick={(e) => {
                   e.stopPropagation();
                   setEditData((prev) => ({ 
                     ...prev, 
                     [item.id]: { ...prev[item.id], [col.key]: null } 
                   }));
                 }}
              >
                Unassigned
              </DropdownMenuItem>
              {allUsers?.filter(u => {
                const role = Array.isArray(u.roletype) ? u.roletype.join(", ").toLowerCase() : (u.roletype?.toLowerCase() || "");
                if (col.key === "testerId") return role === "tester";
                if (col.key === "devId") return role === "developer" || role === "dev";
                return true;
              }).map((u) => (
                 <DropdownMenuItem
                   key={u.id || u._id}
                   className="text-xs py-1.5 cursor-pointer"
                   onClick={(e) => {
                     e.stopPropagation();
                     setEditData((prev) => ({ 
                       ...prev, 
                       [item.id]: { ...prev[item.id], [col.key]: u._id || u.id } 
                     }));
                   }}
                 >
                   {u.name}
                 </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      } else {
        const val = item[col.key];
        const disp = val?.name || (typeof val === "object" ? val?.name : (allUsers?.find(u => u.id === val || u._id === val)?.name)) || "Unassigned";
        return <span className="text-sm truncate block text-gray-700" title={val?.email || ""}>{disp}</span>;
      }
    }

    if (col.type === "textarea") {
      const val = displayData[col.key] || "";
      if (isEditing) {
        return (
          <Textarea
            value={val}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], [col.key]: e.target.value },
              }))
            }
            className="w-full min-h-[60px] text-xs resize-y"
          />
        );
      } else {
        const displayVal = item[col.key] || "";
        return <div className="text-sm max-h-[80px] overflow-y-auto whitespace-pre-wrap text-gray-700">{displayVal || "-"}</div>;
      }
    }

    if (isEditing) {
      const val = displayData[col.key] || "";
      const displayVal = Array.isArray(val) ? val.join(", ") : val;
      return (
        <Input
          value={displayVal}
          onChange={(e) =>
            setEditData((prev) => ({
              ...prev,
              [item.id]: { ...prev[item.id], [col.key]: e.target.value },
            }))
          }
          className="h-8"
        />
      );
    } else {
      const val = item[col.key] || "";
      const displayVal = Array.isArray(val) ? val.join(", ") : val;
      return <span className="text-sm truncate block" title={displayVal}>{displayVal || "-"}</span>;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 justify-end flex absolute right-14 top-2 lg:!right-7 lg:!top-7">
        {canCreate && (
           <Button onClick={() => setIsOpen(true)}>Add Tool</Button>
        )}
      </div>

      <div className="[&>div]:rounded-sm [&>div]:border rounded-xl border border-gray-200 overflow-x-auto overflow-y-auto h-[calc(100vh-280px)] bg-white shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50">
              <TableHead
                className="p-0 flex items-center justify-center h-12 sticky left-0 z-30 border-r border-gray-200"
                style={{ width: 48, minWidth: 48, background: "#f8fafc", top: 0 }}
              >
                <Checkbox 
                  checked={paginatedData?.length > 0 && selectedRows.length === paginatedData.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(paginatedData.map(item => item.id || item._id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </TableHead>
              {tableDetails.map((col) => {
                const isPinned = pinnedColumns.includes(col.key);
                const pinStyle = getPinnedStyle(col.key);
                return (
                <TableHead
                  key={col.key}
                  style={{
                    ...pinStyle,
                    width: colWidths[col.key],
                    backgroundColor: "#f8fafc",
                    top: 0,
                    zIndex: isPinned ? 30 : 20
                  }}
                  className="h-12 border-gray-200 font-semibold text-gray-700 sticky"
                >
                  <ResizableHeader columnKey={col.key} colWidths={colWidths} setColWidths={setColWidths}>
                    <ColumnHeader columnKey={col.key} onPin={handlePinColumn} isPinned={isPinned}>
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
                );
              })}
              <TableHead className="sticky right-0 bg-slate-50 text-center" style={{ width: 96, top: 0, zIndex: 30 }}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!paginatedData || paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableDetails.length + 2} className="h-32 text-center text-gray-400">
                  No tools found. Add a tool to get started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
                const isEditing = editingIds.includes(item.id);
                const displayData = isEditing && editData[item.id] ? editData[item.id] : item;
                
                return (
                  <TableContextMenu
                    key={item.id || item._id}
                    item={item}
                    onEdit={() => {
                      setEditingIds([item.id]);
                      setEditData(prev => ({ ...prev, [item.id]: { ...item } }));
                    }}
                    onDelete={() => handleDeleteSingle(item.id || item._id)}
                    onSaveAll={handleSaveAll}
                    onEditSelected={handleEditSelected}
                    onDeleteSelected={handleDeleteSelected}
                    onCancelAll={handleCancelAll}
                  >
                    <TableRow className="cursor-pointer hover:bg-slate-50/80 transition-colors border-b">
                      <TableCell
                        className="p-0 flex items-center justify-center h-14 sticky left-0 z-10 bg-white border-r border-gray-100"
                        style={{ width: 48, minWidth: 48, left: 0 }}
                      >
                        <Checkbox checked={selectedRows.includes(item.id)} onCheckedChange={() => handleRowSelect(item.id)} />
                      </TableCell>

                      {tableDetails.map((col) => (
                        <TableCell key={col.key} style={{ ...getPinnedStyle(col.key), width: colWidths[col.key], maxWidth: colWidths[col.key] }}>
                          {renderCell(col, item, isEditing, displayData)}
                        </TableCell>
                      ))}

                      <TableCell className="sticky right-0 bg-white z-10 w-24 px-2" style={{ boxShadow: "-2px 0 2px -2px #eee" }}>
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" onClick={() => handleSave(item.id)} className="h-7 px-2 text-xs">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancel(item.id)} className="h-7 px-2 text-xs">Cancel</Button>
                          </div>
                        ) : (() => {
                          if (!canEdit && !canDelete) return <span className="text-gray-400 text-xs">-</span>;

                          return (
                            <TableRowMenu
                              item={item}
                              onEdit={canEdit ? () => {
                                setEditingIds([item.id]);
                                setEditData(prev => ({ ...prev, [item.id]: { ...item } }));
                              } : undefined}
                              onDelete={canDelete ? () => handleDeleteSingle(item.id || item._id) : undefined}
                              onArchive={() => toast.success("Archive tool")}
                            />
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  </TableContextMenu>
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
            Showing {toolList?.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, toolList?.length || 0)} of {toolList?.length || 0} tools
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
};

export default TableTool;
