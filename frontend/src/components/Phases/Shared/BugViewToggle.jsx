import React, { useState } from "react";
import { Search } from "lucide-react";
import BugTable from "./BugTable";
import BugModal from "./BugModal";

export default function BugViewToggle({ phaseBugs, title, actionButton, phaseId, editableColumnKeys, canEditRow }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBugData, setActiveBugData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openModal = (bug) => {
    setActiveBugData(bug);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveBugData(null);
  };

  const navigateModal = (bug) => {
    setActiveBugData(bug);
  };

  const filteredBugs = phaseBugs.filter((bug) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const bugId = bug.bugId?.toLowerCase() || "";
    const toolName = bug.phaseI_BugReport?.toolInfo?.toolName?.toLowerCase() || "";
    const desc = bug.phaseI_BugReport?.toolInfo?.bugDescription?.toLowerCase() || "";
    return bugId.includes(query) || toolName.includes(query) || desc.includes(query);
  });

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header Row: Title, Search, Action Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 mt-2 gap-4">
        {title && <h3 className="text-2xl font-bold">{title}</h3>}
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex items-center w-full md:w-auto">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-full md:w-64 shadow-sm"
            />
          </div>

          {/* Optional Action Button (New Bug) */}
          {actionButton && <div className="ml-0 md:ml-1">{actionButton}</div>}
        </div>
      </div>

      {/* Always render Table View */}
      <BugTable 
        phaseBugs={filteredBugs} 
        onClickCardToModal={openModal} 
        phaseId={phaseId} 
        editableColumnKeys={editableColumnKeys} 
        canEditRow={canEditRow} 
      />

      {/* Shared Modal Overlay */}
      <BugModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        bugData={activeBugData}
        phaseBugs={filteredBugs}
        onNavigate={navigateModal}
      />
    </div>
  );
}
