import React, { useState, useEffect, useRef } from "react";
import { Upload, ArrowUp, ArrowDown, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  { key: "libraryName", label: "Library Version", type: "text", width: 160 },
  { key: "htmlVersion", label: "HTML Version", type: "text", width: 160 },
  { key: "stack", label: "Stack", type: "text", width: 200 },
  { key: "SOP", label: "SOP Document", type: "text", width: 180 },
  { key: "ReleaseNotes", label: "Release Notes", type: "text", width: 200 },
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
  const { toolList, setToolList } = useAuth();
  const [editingIds, setEditingIds] = useState([]);
  const [editData, setEditData] = useState({});
  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );
  const [selectedRows, setSelectedRows] = useState([]);

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

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const renderCell = (col, item, isEditing, displayData) => {
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
      <div className="mb-4 justify-end flex">
        <Button onClick={() => setIsOpen(true)}>Add Tool</Button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-slate-50">
              <TableHead
                className="p-0 flex items-center justify-center h-12 sticky left-0 z-20 border-r border-gray-200"
                style={{ width: 48, minWidth: 48, background: "#f8fafc" }}
              >
              </TableHead>
              {tableDetails.map((col) => (
                <TableHead
                  key={col.key}
                  style={{
                    ...getPinnedStyle(col.key),
                    width: colWidths[col.key],
                    backgroundColor: "#f8fafc"
                  }}
                  className="h-12 border-gray-200 font-semibold text-gray-700"
                >
                  <ResizableHeader columnKey={col.key} colWidths={colWidths} setColWidths={setColWidths}>
                    <ColumnHeader columnKey={col.key} onPin={handlePinColumn} isPinned={pinnedColumns.includes(col.key)}>
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
              ))}
              <TableHead className="sticky right-0 bg-slate-50 z-10 w-24 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!toolList || toolList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableDetails.length + 2} className="h-32 text-center text-gray-400">
                  No tools found. Add a tool to get started.
                </TableCell>
              </TableRow>
            ) : (
              toolList.map((item) => {
                const isEditing = editingIds.includes(item.id);
                const displayData = isEditing && editData[item.id] ? editData[item.id] : item;
                
                return (
                  <TableContextMenu
                    key={item.id}
                    item={item}
                    onEdit={() => {
                      setEditingIds([item.id]);
                      setEditData(prev => ({ ...prev, [item.id]: { ...item } }));
                    }}
                    onDelete={() => {}} // Disabled locally, should trigger API DELETE
                    onSaveAll={() => {}}
                    onEditSelected={() => {}}
                    onDeleteSelected={() => {}}
                    onCancelAll={() => {}}
                  >
                    <TableRow className="cursor-pointer hover:bg-slate-50/80 transition-colors border-b">
                      <TableCell
                        className="p-0 flex items-center justify-center h-14 sticky left-0 z-10 bg-white border-r border-gray-100"
                        style={{ width: 48, minWidth: 48, left: 0 }}
                      >
                        <Checkbox checked={selectedRows.includes(item.id)} onCheckedChange={() => handleRowSelect(item.id)} />
                      </TableCell>

                      {tableDetails.map((col) => (
                        <TableCell key={col.key} style={{ ...getPinnedStyle(col.key), width: colWidths[col.key] }}>
                          {renderCell(col, item, isEditing, displayData)}
                        </TableCell>
                      ))}

                      <TableCell className="sticky right-0 bg-white z-10 w-24 px-2" style={{ boxShadow: "-2px 0 2px -2px #eee" }}>
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" onClick={() => handleSave(item.id)} className="h-7 px-2 text-xs">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancel(item.id)} className="h-7 px-2 text-xs">Cancel</Button>
                          </div>
                        ) : (
                          <TableRowMenu
                            item={item}
                            onEdit={() => {
                              setEditingIds([item.id]);
                              setEditData(prev => ({ ...prev, [item.id]: { ...item } }));
                            }}
                            onDelete={() => {}}
                            onArchive={() => {}}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  </TableContextMenu>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableTool;
