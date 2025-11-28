import React, { useState, useRef } from "react";
import { Upload, ArrowUp, ArrowDown, Pin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableContextMenu from "./RightClickMenu";
import TableRowMenu from "./TableMenu";

// Dynamic column config
const tableDetails = [
  {
    key: "personDetails",
    label: "Personal Details",
    type: "multipleInfo",
    fields: {
      photo: true,
      title: true,
      subheader: true,
    },
    width: 150,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    width: 180,
  },
  {
    key: "username",
    label: "Username",
    type: "text",
    width: 160,
  },
  {
    key: "roles",
    label: "Roles",
    type: "multiselect",
    width: 180,
  },
  {
    key: "adminRight",
    label: "Admin Right",
    type: "multiselect",
    width: 180,
  },
  {
    key: "adminOption",
    label: "Admin Option",
    type: "multiselect",
    width: 200,
  },
];

// Example data
const initialItems = [
  {
    id: "1",
    fullname: "Rohit Singh",
    employId: "#1234",
    src: "https://cdn.shadcnstudio.com/ss-assets/products/product-1.png",
    fallback: "WGC",
    roles: ["Admin"],
    username: "parameswaran9",
    email: "paramsir8@gmail.com",
    adminRight: ["Create", "Edit", "Delete"],
    adminOption: ["share", "generate_report", "insight_view"],
  },
  {
    id: "2",
    fullname: "Aman Sharma",
    employId: "#5678",
    src: "https://cdn.shadcnstudio.com/ss-assets/products/product-2.png",
    fallback: "J1R",
    roles: ["Tester"],
    username: "aman09",
    email: "aman@gmal.com",
    adminRight: ["Create"],
    adminOption: ["share", "generate_report", "insight_view"],
  },
  {
    id: "3",
    fullname: "Ravi Kumar",
    employId: "#9101",
    src: "https://cdn.shadcnstudio.com/ss-assets/products/product-3.png",
    fallback: "O7P",
    roles: ["Developer"],
    username: "ravi88",
    email: "ravi@gmail.com",
    adminRight: ["Edit", "Delete"],
    adminOption: ["share", "insight_view"],
  },
  {
    id: "4",
    fullname: "Yogesh Sharma",
    employId: "#1121",
    src: "https://cdn.shadcnstudio.com/ss-assets/products/product-4.png",
    fallback: "NS",
    roles: ["Developer", "Tester"],
    username: "yogesh24",
    email: "yogesh@company.com",
    adminRight: ["Create", "Edit", "Delete"],
    adminOption: ["generate_report", "insight_view"],
  },
  {
    id: "5",
    fullname: "Saurav",
    employId: "#3141",
    src: "https://cdn.shadcnstudio.com/ss-assets/products/product-5.png",
    fallback: "AMM",
    roles: ["Admin", "Developer"],
    username: "saurav01",
    email: "saurav@gmai.com",
    adminRight: ["Delete", "View"],
    adminOption: ["generate_report", "insight_view"],
  },
];

const roleOptions = ["Admin", "Developer", "Tester", "Manager", "Viewer"];
const adminControlOptions = ["Create", "Edit", "Delete", "View"];
const adminOptionsList = ["share", "generate_report", "insight_view", "export"];

// Resizable header component
const ResizableHeader = ({
  children,
  columnKey,
  colWidths,
  setColWidths,
  showResizeIcon = false,
}) => {
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
    <div
      className="flex items-center group"
      style={{ width: colWidths[columnKey], minWidth: 48 }}
    >
      <div className="flex-1">{children}</div>
      <div
        onMouseDown={handleMouseDown}
        className={`w-4 h-6 cursor-col-resize ml-1 flex items-center justify-center `}
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
          {isPinned && (
            <Pin className="w-4 h-4 text-blue-500" fill="currentColor" />
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 13l-7 7-7-7m0-6l7-7 7 7"
              />
            </svg>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Sort Ascending
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        >
          <ArrowDown className="w-4 h-4 mr-2" />
          Sort Descending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPin(columnKey)}>
          <Pin className="w-4 h-4 mr-2" />
          {isPinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const TableCreation = () => {
  const [items, setItems] = useState(initialItems);
  const [editingIds, setEditingIds] = useState([]); // Array of editing row ids
  const [editData, setEditData] = useState({}); // { [id]: rowData }

  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );
  const [selectedRows, setSelectedRows] = useState([]);

  const handlePinColumn = (columnKey) => {
    setPinnedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((col) => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const getPinnedStyle = (columnKey) => {
    if (!pinnedColumns.includes(columnKey)) return {};
    let left = 0;
    for (const col of tableDetails) {
      if (col.key === columnKey) break;
      if (pinnedColumns.includes(col.key)) {
        left += colWidths[col.key] || 160;
      }
    }
    return {
      position: "sticky",
      left: `${left}px`,
      zIndex: 10,
      background: "white",
      boxShadow: "2px 0 2px -2px #eee",
    };
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSave = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...editData[id] } : it))
    );
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

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((it) => !selectedRows.includes(it.id)));
    setSelectedRows([]);
  };

  const handleEditSelected = () => {
    if (selectedRows.length > 0) {
      setEditingIds(selectedRows);
      // Prepare editData for all selected
      const newEditData = {};
      selectedRows.forEach((id) => {
        const item = items.find((i) => i.id === id);
        if (item) newEditData[id] = { ...item };
      });
      setEditData(newEditData);
    }
  };

  const handleSaveAll = () => {
    setItems((prev) =>
      prev.map((it) =>
        editingIds.includes(it.id) && editData[it.id]
          ? { ...editData[it.id] }
          : it
      )
    );
    setEditingIds([]);
    setEditData({});
    setSelectedRows([]); // Unselect all checkboxes
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleCancelAll = () => {
    setEditingIds([]);
    setEditData({});
    setSelectedRows([]); // Unselect all checkboxes
  };

  // Cell renderers by type
  const renderCell = (col, item, isEditing, displayData, setRowEditData) => {
    if (col.type === "multipleInfo") {
      return (
        <div className="flex items-center gap-3">
          {col.fields.photo && (
            <Avatar className="rounded-full w-12 h-12">
              <AvatarImage src={displayData.src} alt={item.employId} />
              <AvatarFallback className="text-xs">
                {item.fallback}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {col.fields.title && (
              <div className="font-medium">
                {isEditing ? (
                  <Input
                    value={displayData.fullname ?? ""}
                    onChange={(e) =>
                      setRowEditData({ fullname: e.target.value })
                    }
                    className="h-8 mb-1"
                  />
                ) : (
                  item.fullname
                )}
              </div>
            )}
            {col.fields.subheader && !isEditing && (
              <span className="text-muted-foreground mt-0.5 text-[11px]">
                {item.employId}
              </span>
            )}
          </div>
        </div>
      );
    }
    if (col.type === "email") {
      return isEditing ? (
        <Input
          type="email"
          value={displayData.email ?? ""}
          onChange={(e) => setRowEditData({ email: e.target.value })}
          className="h-8"
        />
      ) : (
        item.email
      );
    }
    if (col.type === "text") {
      return isEditing ? (
        <Input
          value={displayData[col.key] ?? ""}
          onChange={(e) => setRowEditData({ [col.key]: e.target.value })}
          className="h-8"
        />
      ) : (
        item[col.key]
      );
    }
    if (col.type === "multiselect") {
      const options =
        col.key === "roles"
          ? roleOptions
          : col.key === "adminRight"
          ? adminControlOptions
          : adminOptionsList;
      return isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-full justify-start text-left"
            >
              <span className="truncate">
                {(displayData[col.key] ?? []).length > 0
                  ? displayData[col.key].join(", ")
                  : "Select"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={(displayData[col.key] ?? []).includes(option)}
                onClick={(event) => {
                  event.preventDefault();
                  const currentArray = displayData[col.key] ?? [];
                  const newArray = currentArray.includes(option)
                    ? currentArray.filter((item) => item !== option)
                    : [...currentArray, option];
                  setRowEditData({ [col.key]: newArray });
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="max-w-[180px]">
          <span
            className="text-sm truncate block"
            title={(item[col.key] ?? []).join(", ")}
          >
            {(item[col.key] ?? []).join(", ")}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="[&>div]:rounded-sm [&>div]:border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="p-0 flex items-center justify-center h-16 sticky left-0 z-20 bg-white"
                style={{
                  width: colWidths.checkbox,
                  minWidth: 48,
                  maxWidth: 120,
                }}
              >
                {/* No resize for checkbox column */}
              </TableHead>
              {tableDetails.map((col) => (
                <TableHead
                  key={col.key}
                  style={{
                    ...getPinnedStyle(col.key),
                    width: colWidths[col.key],
                    minWidth: 60,
                    maxWidth: 600,
                  }}
                >
                  <ResizableHeader
                    columnKey={col.key}
                    colWidths={colWidths}
                    setColWidths={setColWidths}
                  >
                    <ColumnHeader
                      columnKey={col.key}
                      onPin={handlePinColumn}
                      isPinned={pinnedColumns.includes(col.key)}
                    >
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
              ))}
              <TableHead
                className="sticky right-0 bg-white z-10"
                style={{ width: 120, minWidth: 60, maxWidth: 600 }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const isEditing = editingIds.includes(item.id);
              const displayData =
                isEditing && editData[item.id] ? editData[item.id] : item;
              return (
                <TableContextMenu
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingIds([item.id])}
                  onDelete={() =>
                    setItems((prev) => prev.filter((it) => it.id !== item.id))
                  }
                  onSaveAll={handleSaveAll}
                  onEditSelected={handleEditSelected}
                  onDeleteSelected={handleDeleteSelected}
                  onCancelAll={handleCancelAll}
                >
                  <TableRow className="cursor-pointer hover:bg-gray-50">
                    {/* Row checkbox */}
                    <TableCell
                      className="p-0 flex items-center justify-center h-16 sticky left-0 z-10 bg-white"
                      style={{
                        width: colWidths.checkbox,
                        minWidth: 48,
                        maxWidth: 120,
                      }}
                    >
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onCheckedChange={() => handleRowSelect(item.id)}
                        id={`checkbox-${item.id}`}
                      />
                    </TableCell>
                    {/* Dynamic columns */}
                    {tableDetails.map((col) => (
                      <TableCell
                        key={col.key}
                        style={{
                          ...getPinnedStyle(col.key),
                          width: colWidths[col.key],
                          minWidth: 60,
                          maxWidth: 600,
                        }}
                      >
                        {renderCell(col, item, isEditing, displayData, (val) =>
                          setEditData((prev) => ({
                            ...prev,
                            [item.id]: { ...(prev[item.id] || item), ...val },
                          }))
                        )}
                      </TableCell>
                    ))}
                    {/* Actions */}
                    <TableCell
                      className="sticky right-0 bg-white z-10"
                      style={{ width: 120, minWidth: 60, maxWidth: 600 }}
                    >
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(item.id)}
                            className="h-8 px-3"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(item.id)}
                            className="h-8 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <TableRowMenu
                          item={item}
                          onEdit={() => setEditingIds([item.id])}
                          onDelete={() =>
                            setItems((prev) =>
                              prev.filter((it) => it.id !== item.id)
                            )
                          }
                          onArchive={() => alert("Archive " + item.id)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                </TableContextMenu>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableCreation;
