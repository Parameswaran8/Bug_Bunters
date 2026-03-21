import React, { useState } from "react";
import { Copy, MapPin, AlertCircle, Clock } from "lucide-react";

export default function BugCardGrid({ phaseBugs, onClickCardToModal, phaseId }) {
  const [visibleCount, setVisibleCount] = useState(10);
  if (phaseBugs.length === 0) {
    return (
      <div className="flex bg-white items-center justify-center p-10 border rounded-xl text-gray-500 mt-4 shadow-sm">
        No bugs in this phase plotted yet.
      </div>
    );
  }

  const visibleBugs = phaseBugs.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {visibleBugs.map((bug) => {
          const priority = bug.phaseI_BugReport?.toolInfo?.priority || "low";
        
        const raiser = bug.phaseI_BugReport?.reportedBy?.name || "Unknown";
        const raiserEmail = bug.phaseI_BugReport?.reportedBy?.email || "No email provided";
        const testerObj = bug.phaseI_BugReport?.assignedTester || bug.phaseII_BugConfirmation?.testedBy;
        const tester = testerObj?.name || "Unassigned";
        const testerEmail = testerObj?.email || "No email provided";
        const developer = bug.phaseII_BugConfirmation?.assignedDeveloper?.name || "Unassigned";
        const developerEmail = bug.phaseII_BugConfirmation?.assignedDeveloper?.email || "No email provided";
        
        return (
          <div 
            key={bug._id || bug.bugId}
            onClick={() => onClickCardToModal(bug)}
            className="group relative flex flex-col justify-between bg-white rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase
                ${priority === 'critical' ? 'bg-red-50 text-red-600' :
                  priority === 'high' ? 'bg-orange-50 text-orange-600' :
                  priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                  'bg-green-50 text-green-600'
                }`}>
                {priority}
              </span>
              <span className="text-xs font-bold text-gray-400 group-hover:text-cyan-600 transition-colors">
                {bug.bugId || "N/A"}
              </span>
            </div>

            {/* Content */}
            <div className="mb-4 flex-1">
              <h4 className="text-[17px] font-bold text-gray-900 leading-tight mb-1.5 line-clamp-1">
                {bug.phaseI_BugReport?.toolInfo?.toolName || "Unknown Tool"}
              </h4>
              
              {/* Conditionally render info based on phase */}
              {phaseId === "testing" ? (
                <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed bg-slate-50 border border-slate-100 p-2 rounded-lg">
                   <strong className="text-gray-800 block text-xs mb-0.5">Remarks:</strong>
                   {bug.phaseII_BugConfirmation?.testingInfo?.remarks || "No remarks provided."}
                </div>
              ) : phaseId === "analyze" ? (
                <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed bg-red-50 border border-red-100 p-2 rounded-lg">
                   <strong className="text-red-800 block text-xs mb-0.5">Conclusion / Root Cause:</strong>
                   {bug.phaseIII_BugAnalysis?.analysisInfo?.rootCause || "No conclusion yet."}
                </div>
              ) : (
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {bug.phaseI_BugReport?.toolInfo?.bugDescription || "No description provided."}
                </p>
              )}
              
              {/* Users */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {/* Raiser */}
                <div className="flex items-center gap-2" title={raiserEmail}>
                  <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 text-[10px] font-bold shrink-0">
                     {raiser[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Reported By</span>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{raiser}</span>
                  </div>
                </div>

                {/* Specific based on phase */}
                {(phaseId === "create" || phaseId === "analyze") && (
                  <div className="flex items-center gap-2" title={testerEmail}>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold shrink-0">
                       {tester[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Tester</span>
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{tester}</span>
                    </div>
                  </div>
                )}
                
                {(phaseId === "testing" || phaseId === "rtt" || phaseId === "rtd") && (
                  <div className="flex items-center gap-2" title={developerEmail}>
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[10px] font-bold shrink-0">
                       {developer[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase leading-none">Developer</span>
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{developer}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row metadata */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center text-xs font-medium text-gray-500 gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {bug.phaseI_BugReport?.reportedAt ? new Date(bug.phaseI_BugReport.reportedAt).toLocaleDateString() : "-"}
              </div>
              <div className="flex items-center text-xs font-medium text-gray-500 gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {bug.phaseI_BugReport?.toolInfo?.platform || "-"}
              </div>
            </div>
          </div>
        );
      })}
      </div>
      
      {visibleCount < phaseBugs.length && (
        <div className="flex justify-center mt-4 mb-2">
          <button 
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="px-6 py-2.5 bg-white border-2 border-slate-100 hover:border-cyan-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 font-semibold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2"
          >
            Show more cards
          </button>
        </div>
      )}
    </div>
  );
}
