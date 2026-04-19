import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function BugModal({ 
  isOpen, 
  onClose, 
  bugData, 
  phaseBugs, 
  onNavigate 
}) {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (bugData && phaseBugs) {
      const idx = phaseBugs.findIndex(b => b._id === bugData._id || b.bugId === bugData.bugId);
      setCurrentIndex(idx);
    }
  }, [bugData, phaseBugs]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(phaseBugs[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < phaseBugs.length - 1) {
      onNavigate(phaseBugs[currentIndex + 1]);
    }
  };

  if (!bugData) return null;

  const toolName = bugData.phaseI_BugReport?.toolInfo?.toolName || "-";
  const priority = bugData.phaseI_BugReport?.toolInfo?.priority || "low";
  const desc = bugData.phaseI_BugReport?.toolInfo?.bugDescription || "No description provided";
  const bugId = bugData.bugId || "N/A";
  
  const raiser = bugData.phaseI_BugReport?.reportedBy?.name || "Unknown";
  const tester = bugData.phaseI_BugReport?.assignedTester?.name || "Unassigned";
  const developer = bugData.phaseII_BugConfirmation?.assignedDeveloper?.name || "Unassigned";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-slate-50 flex flex-col h-[85vh]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase
              ${priority === 'critical' ? 'bg-red-100 text-red-700' :
                priority === 'high' ? 'bg-orange-100 text-orange-700' :
                priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
              {priority}
            </div>
            <span className="text-sm font-bold text-gray-400">{bugId}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handlePrev} 
               disabled={currentIndex <= 0}
               className="h-8 px-2.5 text-gray-500 hover:text-gray-900"
             >
               <ChevronLeft className="w-4 h-4 mr-1" />
               Prev
             </Button>
             <span className="text-xs font-semibold text-gray-400 px-2">
               {currentIndex + 1} of {phaseBugs.length}
             </span>
             <Button 
               variant="outline" 
               size="sm" 
               onClick={handleNext} 
               disabled={currentIndex >= phaseBugs.length - 1}
               className="h-8 px-2.5 text-gray-500 hover:text-gray-900"
             >
               Next
               <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-2xl font-black text-gray-900 mb-6">{toolName}</h2>
          
          <div className="bg-white rounded-2xl p-5 border shadow-sm mb-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-start">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bug Raiser</span>
               <span className="text-sm font-semibold text-gray-800">{raiser}</span>
             </div>
             <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-start">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Tester</span>
               <span className="text-sm font-semibold text-gray-800">{tester}</span>
             </div>
             <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col items-start">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Dev</span>
               <span className="text-sm font-semibold text-gray-800">{developer}</span>
             </div>
          </div>

          {/* Results Section - Only show if not N/A */}
          {(bugData.phaseI_BugReport?.toolInfo?.expectedResult !== "Not Applicable (Simple Description)" || 
            bugData.phaseI_BugReport?.toolInfo?.actualResult !== "Not Applicable (Simple Description)") && (
            <div className={`grid gap-4 ${
              (bugData.phaseI_BugReport?.toolInfo?.expectedResult !== "Not Applicable (Simple Description)" && 
               bugData.phaseI_BugReport?.toolInfo?.actualResult !== "Not Applicable (Simple Description)") 
               ? "grid-cols-1 md:grid-cols-2" 
               : "grid-cols-1"
            }`}>
               {bugData.phaseI_BugReport?.toolInfo?.expectedResult !== "Not Applicable (Simple Description)" && (
                 <div className="bg-white rounded-2xl p-5 border shadow-sm">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Expected Result</h3>
                   <p className="text-sm text-gray-700">{bugData.phaseI_BugReport?.toolInfo?.expectedResult || "-"}</p>
                 </div>
               )}
               {bugData.phaseI_BugReport?.toolInfo?.actualResult !== "Not Applicable (Simple Description)" && (
                 <div className="bg-white rounded-2xl p-5 border shadow-sm">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Actual Result</h3>
                   <p className="text-sm text-gray-700">{bugData.phaseI_BugReport?.toolInfo?.actualResult || "-"}</p>
                 </div>
               )}
            </div>
          )}
          
          {/* Add Forms here to actually update the bug states going forward! */}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-white border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
