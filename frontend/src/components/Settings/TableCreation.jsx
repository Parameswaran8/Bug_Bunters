import React, { useState, useRef } from "react";
import { Upload, ArrowUp, ArrowDown, Pin, ChevronLeft, ChevronRight } from "lucide-react";
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
    label: "Person Details",
    type: "multipleInfo",
    fields: {
      photo: true,
      title: true,
      subheader: true,
    },
    width: 180,
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
  {
    key: "createdAt",
    label: "Created Date",
    type: "date",
    width: 140,
  }
];

import { useAuth } from "@/context/AuthContext";
import { updateUser, deleteUser } from "@/API_Call/User";
import toast from "react-hot-toast";

const roleOptions = ["Admin", "Developer", "Tester", "Bug Reporter"];
const adminControlOptions = ["Create", "Edit", "Delete", "View"];
const adminOptionsList = ["Share", "Generate Report", "Insight View", "Export"];

const toProperCase = (str) => {
  if (!str) return "";
  const s = str.toLowerCase();
  if (s === "generate_report" || s === "generate report") return "Generate Report";
  if (s === "insight_view" || s === "insight view") return "Insight View";
  if (s === "bugreporter" || s === "bug reporter") return "Bug Reporter";
  if (s === "dev" || s === "developer") return "Developer";
  if (s === "tester") return "Tester";
  if (s === "admin") return "Admin";
  
  // Format words automatically
  return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

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

const TableCreation = ({ isOpen, setIsOpen, searchQuery = "" }) => {
  const { allUsers, setAllUsers, user: currentUser } = useAuth();
  const [editingIds, setEditingIds] = useState([]); // Array of editing row ids
  const [editData, setEditData] = useState({}); // { [id]: rowData }

  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [colWidths, setColWidths] = useState(
    Object.fromEntries(tableDetails.map((col) => [col.key, col.width || 160]))
  );
  const [selectedRows, setSelectedRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter data based on search query
  const filteredUsers = allUsers?.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      (Array.isArray(user.roletype) ? user.roletype.join(" ") : user.roletype)?.toLowerCase().includes(query)
    );
  }) || [];

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedData = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePinColumn = (columnKey) => {
    setPinnedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((col) => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const getPinnedStyle = (columnKey) => {
    // Checkbox column is always sticky at left: 0
    if (!pinnedColumns.includes(columnKey)) return {};
    let left = colWidths.checkbox || 48; // Start after checkbox column
    for (const col of tableDetails) {
      if (col.key === columnKey) break;
      if (pinnedColumns.includes(col.key)) {
        left += colWidths[col.key] || 160;
      }
    }
    // If this is the checkbox column, left should be 0
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
    setEditingIds([item.id]);
    setEditData({ [item.id]: { ...item } });
  };

  const handleSave = async (id) => {
    // Sync backend...
    const dataToSave = editData[id];
    let finalRole = dataToSave.roles !== undefined ? dataToSave.roles.map(r => {
        const rc = r.toLowerCase();
        if (rc === "developer") return "dev";
        if (rc === "bug reporter" || rc === "bugreporter") return "bugreporter";
        if (rc === "admin") return "admin";
        return rc;
    }) : (Array.isArray(dataToSave.roletype) ? dataToSave.roletype : [dataToSave.roletype || "bugreporter"]);

    const isAdminFinal = finalRole.includes("admin") || finalRole.includes("superadmin");

    let finalAdminControl = [];
    let finalAdminOption = [];

    if (isAdminFinal) {
        finalAdminControl = (dataToSave.adminRight !== undefined ? dataToSave.adminRight : (dataToSave.adminControl || [])).map(v => v.toLowerCase());
        if (finalAdminControl.some(r => ["create", "edit", "delete"].includes(r)) && !finalAdminControl.includes("view")) {
            finalAdminControl.push("view");
        }
        finalAdminOption = (dataToSave.adminOption || []).map(v => v.toLowerCase().replace(" ", "_"));
    }

    const updatePayload = {
      name: dataToSave.name,
      email: dataToSave.email,
      username: dataToSave.username,
      roletype: finalRole,
      adminControl: finalAdminControl,
      adminOption: finalAdminOption
    };
    
    try {
      const res = await updateUser(id, updatePayload);
      if (res.success) {
        // Sync frontend context array 
        setAllUsers((prev) =>
          prev.map((it) => (it.id === id ? { ...it, ...updatePayload } : it))
        );
        toast.success("User updated!");
      } else {
        toast.error(res.message);
      }
    } catch(err) {
      toast.error("Failed to update user.");
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

  const handleDeleteSelected = async () => {
    // Ideally map deletes over Promise.all
    for(const id of selectedRows) {
        await deleteUser(id);
    }
    setAllUsers((prev) => prev.filter((it) => !selectedRows.includes(it.id)));
    setSelectedRows([]);
    toast.success("Users deleted!");
  };

  const handleDeleteSingle = async (id) => {
     try {
       const res = await deleteUser(id);
       if (res.success) {
          setAllUsers(prev => prev.filter(it => it.id !== id));
          toast.success("User deleted!");
       } else {
          toast.error(res.message);
       }
     } catch(err) {
       toast.error("Delete failed!");
     }
  };

  const handleEditSelected = () => {
    if (selectedRows.length > 0) {
      setEditingIds(selectedRows);
      // Prepare editData for all selected
      const newEditData = {};
      selectedRows.forEach((id) => {
        const item = allUsers.find((i) => i.id === id);
        if (item) newEditData[id] = { ...item };
      });
      setEditData(newEditData);
    }
  };

  const handleSaveAll = async () => {
    for (const id of editingIds) {
      if (editData[id]) await handleSave(id);
    }
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
            <Avatar className="rounded-full w-12 h-12 border bg-gray-50 flex justify-center items-center">
              <AvatarFallback className="text-xs bg-transparent">
                {item.name ? item.name.substring(0,2).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            {col.fields.title && (
              <div className="font-medium">
                {isEditing ? (
                  <Input
                    value={displayData.name ?? ""}
                    onChange={(e) =>
                      setRowEditData({ name: e.target.value })
                    }
                    className="h-8 mb-1"
                  />
                ) : (
                  item.name || item.username
                )}
              </div>
            )}
            {col.fields.subheader && !isEditing && (
              <span className="text-muted-foreground mt-0.5 text-[14px]">
                {item.role || "user"}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    if (col.type === "date") {
       const dateVal = item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "-";
       return <span className="text-gray-500 whitespace-nowrap text-sm">{dateVal}</span>;
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
          ? ["Admin", "Developer", "Tester", "Bug Reporter"]
          : col.key === "adminRight"
          ? adminControlOptions
          : adminOptionsList;

      // Extract raw arrays representing options based off new Mongo structure dynamically
      let currentValRaw = [];
      if (col.key === "roles") {
        currentValRaw = displayData.roles !== undefined ? displayData.roles : (Array.isArray(displayData.roletype) ? displayData.roletype : (displayData.roletype ? [displayData.roletype] : []));
      } else if (col.key === "adminRight") {
        currentValRaw = displayData.adminRight !== undefined ? displayData.adminRight : (displayData.adminControl || []);
      } else if (col.key === "adminOption") {
        currentValRaw = displayData.adminOption || [];
      }
      
      currentValRaw = currentValRaw.map(v => toProperCase(v));

      const currentRolesRaw = displayData.roles !== undefined ? displayData.roles : (Array.isArray(displayData.roletype) ? displayData.roletype : (displayData.roletype ? [displayData.roletype] : []));
      const isAdmin = currentRolesRaw.some(r => r.toLowerCase() === "admin");
      const isDisabled = !isAdmin && (col.key === "adminRight" || col.key === "adminOption");

      return isEditing ? (
        <div className="w-full" title={isDisabled ? "This is admin rights" : ""}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-full justify-start text-left"
                disabled={isDisabled}
              >
                <span className="truncate">
                  {currentValRaw.length > 0
                    ? currentValRaw.join(", ")
                    : "Select"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={currentValRaw.includes(option)}
                onClick={(event) => {
                  event.preventDefault();
                  // Standard multi-select toggle for all options
                  const newArray = currentValRaw.includes(option)
                      ? currentValRaw.filter((item) => item !== option)
                      : [...currentValRaw, option];
                  
                  if (col.key === "roles") {
                     setRowEditData({ roles: newArray });
                  } else if (col.key === "adminRight") {
                     setRowEditData({ adminRight: newArray });
                  } else {
                     setRowEditData({ adminOption: newArray });
                  }
                }}
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      ) : (
        <div className="max-w-[180px]">
          <span
            className="text-sm truncate block"
            title={currentValRaw.join(", ")}
          >
            {currentValRaw.join(", ")}
          </span>
        </div>
      );
    }
    return null;
  };

  const canCreate = allUsers && (useAuth().user?.role === "superadmin" || useAuth().user?.adminControl?.includes("create"));

  return (
    <div className="w-full">

      <div className="[&>div]:rounded-sm [&>div]:border overflow-x-auto overflow-y-auto h-[calc(100vh-280px)]">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead
                className="p-0 flex items-center justify-center h-16 sticky left-0 z-30 bg-white"
                style={{
                  width: colWidths.checkbox,
                  minWidth: 48,
                  maxWidth: 120,
                  left: 0,
                  top: 0,
                  zIndex: 30,
                  background: "white",
                }}
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
                  className="sticky"
                  style={{
                    ...pinStyle,
                    width: colWidths[col.key],
                    minWidth: 60,
                    maxWidth: 600,
                    top: 0,
                    zIndex: isPinned ? 30 : 20,
                    backgroundColor: 'white'
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
                      isPinned={isPinned}
                    >
                      {col.label}
                    </ColumnHeader>
                  </ResizableHeader>
                </TableHead>
                );
              })}
              <TableHead
                className="sticky right-0 top-0 bg-white"
                style={{ width: 120, minWidth: 60, maxWidth: 600, zIndex: 30 }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {(!paginatedData || paginatedData.length === 0) ? (
              <TableRow>
                 <TableCell colSpan={tableDetails.length + 2} className="text-center py-10 text-gray-500">
                    No users found.
                 </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => {
              const isEditing = editingIds.includes(item.id);
              const displayData =
                isEditing && editData[item.id] ? editData[item.id] : item;
              return (
                <TableContextMenu
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingIds([item.id])}
                  onDelete={() => handleDeleteSingle(item.id)}
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
                        left: 0,
                        zIndex: 20,
                        background: "white",
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
                      ) : (() => {
                         const isSuperAdminEditBlocked = item.role === "superadmin" && currentUser?.role !== "superadmin";
                         const canEdit = currentUser?.role === "superadmin" || currentUser?.adminControl?.includes("edit");
                         const canDelete = currentUser?.role === "superadmin" || currentUser?.adminControl?.includes("delete");

                         if (isSuperAdminEditBlocked) return <span className="text-gray-400 text-xs italic">Protected</span>;
                         if (!canEdit && !canDelete) return null;

                         return (
                            <TableRowMenu
                              item={item}
                              onEdit={canEdit ? () => handleEdit(item) : undefined}
                              onDelete={canDelete ? () => handleDeleteSingle(item.id) : undefined}
                              onArchive={() => alert("Archive " + item.id)}
                            />
                         );
                      })()}
                    </TableCell>
                  </TableRow>
                </TableContextMenu>
              );
            }))}
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
            Showing {allUsers?.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, allUsers?.length || 0)} of {allUsers?.length || 0} users
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

export default TableCreation;
