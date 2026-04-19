import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  History, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  User,
  Filter,
  Info,
  Bug as BugIcon,
  Search,
  Download,
  Calendar,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getBugLogs, getBugById } from "@/API_Call/Bug";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const ALL_COLUMNS = [
  { key: "logTimestamp", label: "Date & Time", width: 180 },
  { key: "bugId", label: "Bug ID", width: 140 },
  { key: "toolName", label: "Tool Name", width: 180 },
  { key: "priority", label: "Priority", width: 120 },
  { key: "stack", label: "Stack", width: 120 },
  { key: "reportedBy", label: "Bug Raiser", width: 150 },
  { key: "issueFacedBy", label: "Issue Faced By", width: 160 },
  { key: "assignedTester", label: "Assigned Tester", width: 150 },
  { key: "assignedDev", label: "Assigned Dev", width: 150 },
  { key: "sopFollowedRaiser", label: "SOP by Raiser", width: 220 },
  { key: "testerSop", label: "Tester SOP", width: 220 },
  { key: "bugDescription", label: "Bug Description", width: 300 },
  { key: "status", label: "Bug Status", width: 150 },
  { key: "expectedResult", label: "Expected Result", width: 250 },
  { key: "actualResult", label: "Actual Result", width: 250 },
  { key: "rootCause", label: "Root Cause", width: 200 },
  { key: "remarks", label: "Testing Remark", width: 200 },
  { key: "analyzeRemark", label: "Analyse Remark", width: 200 },
  { key: "sopForSolution", label: "SOP for Solution", width: 200 },
  { key: "delayedReason", label: "Delayed Reason", width: 200 },
  { key: "testingFlag", label: "Testing Flag", width: 170 },
  { key: "finalTestingRemark", label: "Final Testing Remark", width: 200 },
  { key: "deploymentStatus", label: "Deployment Status", width: 170 },
  { key: "deployRemark", label: "Deploy Remark", width: 200 },
  { key: "finalSop", label: "Final SOP", width: 200 },
  { key: "reportedDate", label: "Reported At", width: 180 },
  { key: "logAction", label: "Action", width: 150 },
  { key: "logUser", label: "Performed By", width: 180 },
  { key: "currentPhase", label: "Current Phase", width: 160 },
];

export default function BugActivityLog() {
  const { id } = useParams();
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bugDetails, setBugDetails] = useState(null);

  const flattenBug = (bug) => {
    if (!bug) return {};
    const p1 = bug.phaseI_BugReport || {};
    const tool = p1.toolInfo || {};
    const client = p1.clientContext || {};
    
    // Helper to get status from current or fallback phases
    const getStatus = () => {
       return bug.phaseIV_Maintenance?.maintenanceInfo?.status || 
              bug.phaseIII_BugAnalysis?.analysisInfo?.status || 
              bug.phaseII_BugConfirmation?.testingInfo?.status || 
              "-";
    };

    // Format SOP Raiser Checklist to string
    const getSopRaiser = () => {
      const checklist = client.sopChecklist;
      if (!checklist) return "-";
      return Object.entries(checklist)
        .filter(([_, checked]) => checked)
        .map(([text]) => text)
        .join(", ") || "-";
    };

    const getName = (user) => {
      if (!user) return "-";
      if (typeof user === 'object') return user.name || user.fullName || user.label || "-";
      return user;
    };

    return {
      bugId: bug.bugId,
      toolName: tool.toolName,
      priority: tool.priority,
      stack: tool.stack,
      reportedBy: getName(p1.reportedBy),
      issueFacedBy: client.facedByClient ? client.clientName : 'Self',
      assignedTester: getName(p1.assignedTester),
      assignedDev: getName(bug.phaseII_BugConfirmation?.assignedDeveloper),
      sopFollowedRaiser: getSopRaiser(),
      testerSop: Array.isArray(bug.phaseII_BugConfirmation?.testingInfo?.sopFollowed) 
        ? bug.phaseII_BugConfirmation.testingInfo.sopFollowed.join(", ") 
        : bug.phaseII_BugConfirmation?.testingInfo?.sopFollowed || "-",
      bugDescription: tool.bugDescription,
      status: getStatus(),
      currentPhase: bug.currentPhase,
      expectedResult: tool.expectedResult,
      actualResult: tool.actualResult,
      rootCause: bug.phaseIII_BugAnalysis?.analysisInfo?.rootCause,
      remarks: bug.phaseII_BugConfirmation?.testingInfo?.remarks || "-",
      analyzeRemark: bug.phaseIII_BugAnalysis?.analysisInfo?.remarks || "-",
      sopForSolution: Array.isArray(bug.phaseIII_BugAnalysis?.analysisInfo?.sopProvided)
        ? bug.phaseIII_BugAnalysis.analysisInfo.sopProvided.join(", ")
        : bug.phaseIII_BugAnalysis?.analysisInfo?.sopProvided || "-",
      delayedReason: bug.phaseIII_BugAnalysis?.analysisInfo?.delayedReason,
      testingFlag: bug.phaseIV_Maintenance?.maintenanceInfo?.testingFlag || "-",
      finalTestingRemark: bug.phaseIV_Maintenance?.maintenanceInfo?.remarks || "-",
      deploymentStatus: bug.phaseV_FinalTesting?.testingInfo?.deploymentStatus,
      deployRemark: bug.phaseV_FinalTesting?.testingInfo?.deployRemark,
      finalSop: bug.phaseV_FinalTesting?.testingInfo?.finalSop,
      reportedDate: bug.createdAt
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logRes, bugRes] = await Promise.all([
          getBugLogs({ id }),
          getBugById({ id })
        ]);

        if (logRes.success && bugRes.success) {
          const bug = bugRes.data.result;
          setBugDetails(bug);
          
          const rawLogs = logRes.data.results || [];
          const sortedLogs = [...rawLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          let timeline = [];
          let tempState = flattenBug(bug);

          sortedLogs.forEach((log) => {
            try {
              const details = JSON.parse(log.details);
              let changedFields = [];
              const snapshotState = { ...tempState };

              if (log.type === 'creation') {
                changedFields = Object.keys(details);
                tempState = {}; 
              } else if (Array.isArray(details)) {
                details.forEach(diff => {
                  if (diff && diff.field) {
                    // Precise mapping from MongoDB path to flattened key
                    const pathMap = {
                      'phaseII_BugConfirmation.testingInfo.remarks': 'remarks',
                      'testingInfo.remarks': 'remarks',
                      'phaseIII_BugAnalysis.analysisInfo.remarks': 'analyzeRemark',
                      'analysisInfo.remarks': 'analyzeRemark',
                      'phaseIII_BugAnalysis.analysisInfo.sopProvided': 'sopForSolution',
                      'analysisInfo.sopProvided': 'sopForSolution',
                      'sopProvided': 'sopForSolution',
                      'phaseIII_BugAnalysis.analysisInfo.delayedReason': 'delayedReason',
                      'phaseIV_Maintenance.maintenanceInfo.testingFlag': 'testingFlag',
                      'maintenanceInfo.testingFlag': 'testingFlag',
                      'phaseIV_Maintenance.maintenanceInfo.remarks': 'finalTestingRemark',
                      'maintenanceInfo.remarks': 'finalTestingRemark',
                      'phaseV_FinalTesting.testingInfo.deploymentStatus': 'deploymentStatus',
                      'testingInfo.deploymentStatus': 'deploymentStatus',
                      'phaseII_BugConfirmation.assignedDeveloper': 'assignedDev',
                      'phaseI_Reported.assignedTester': 'assignedTester',
                      'phaseII_BugConfirmation.testingInfo.sopFollowed': 'testerSop',
                      'testingInfo.sopFollowed': 'testerSop',
                      'sopFollowed': 'testerSop',
                      'phaseI_Reported.sopChecklist': 'sopFollowedRaiser',
                    };

                    let field = pathMap[diff.field] || diff.field.split('.').pop();
                    
                    // Special check: if the field is 'status' it might be 'phaseII_BugConfirmation.status'
                    if (diff.field.includes('status') && !pathMap[diff.field]) field = 'status';

                    // Helper to get visual string or ID for comparison
                    const getCompareValue = (val) => {
                      if (!val) return "";
                      if (typeof val === 'object') return String(val._id || val.id || val.name || "");
                      return String(val).trim();
                    };
                    
                    const oldV = getCompareValue(diff.oldValue);
                    const newV = getCompareValue(diff.newValue);

                    if (oldV !== newV) {
                      changedFields.push(field);
                    }

                    tempState[field] = diff.oldValue;
                  }
                });
              }

              // Add log-specific metadata to the state for the row
              const finalState = { 
                ...snapshotState,
                logTimestamp: log.timestamp,
                logAction: log.action,
                logUser: log.performedBy?.name || "System"
              };

              timeline.push({
                ...log,
                state: finalState,
                changedFields
              });
            } catch (e) {
              console.error("Error parsing log details", e);
            }
          });

          setSnapshots(timeline);
        }
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getPriorityColor = (p) => {
    const priority = String(p || '').toLowerCase();
    if (priority === 'high' || priority === 'critical') return "bg-rose-50 text-rose-700 border-rose-100";
    if (priority === 'medium') return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getStatusColor = (s) => {
    const status = String(s || '').toLowerCase();
    if (status.includes('resolved') || status.includes('closed') || status.includes('minor') || status.includes('fix')) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status.includes('pending') || status.includes('progress') || status.includes('testing')) return "bg-blue-50 text-blue-700 border-blue-100";
    if (status.includes('reopen') || status.includes('critical') || status.includes('rejected')) return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const renderCellContent = (key, value) => {
    if (key === 'logTimestamp') {
      try {
        return <span className="text-xs font-bold text-slate-900">{format(new Date(value), "dd/MM/yyyy HH:mm:ss")}</span>;
      } catch (e) {
        return <span className="text-xs font-bold text-slate-400">Invalid Date</span>;
      }
    }

    if (key === 'logAction') {
      return <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{String(value)}</span>;
    }

    if (key === 'logUser') {
       return <span className="text-xs font-bold text-slate-700">{String(value)}</span>;
    }

    if (value === null || value === undefined || value === "" || value === "-") return <span className="text-slate-300">—</span>;
    
    if (key === 'priority') {
      return (
        <Badge variant="outline" className={`font-black uppercase text-[10px] tracking-widest ${getPriorityColor(value)}`}>
          {value}
        </Badge>
      );
    }
    
    if (key === 'status') {
      return (
        <Badge variant="outline" className={`font-bold text-[11px] ${getStatusColor(value)}`}>
          {value}
        </Badge>
      );
    }

    if (key === 'testingFlag') {
      const getFlagColor = (val) => {
        if (val === 'Go back to dev' || val === 'Red flag') return 'text-red-500';
        if (val === 'Test by bug raiser' || val === 'Blue Flag') return 'text-blue-500';
        if (val === 'Ready for rollout' || val === 'Green Flag') return 'text-green-500';
        return 'text-slate-300';
      };
      return (
        <div className="flex items-center gap-1.5">
           <Flag className={`w-3.5 h-3.5 shrink-0 ${getFlagColor(value)}`} fill="currentColor" />
           <span className="text-xs font-medium text-slate-700">{value}</span>
        </div>
      );
    }

    if (key === 'reportedDate') {
       return <span className="text-[11px] font-medium text-slate-500">{format(new Date(value), "MMM d, yyyy")}</span>;
    }

    if (Array.isArray(value)) {
      return <span className="text-xs font-medium text-slate-700">{value.join(", ")}</span>;
    }

    if (typeof value === 'object' && value !== null) {
      if (value.name) return <span className="text-xs font-medium text-slate-700">{value.name}</span>;
      if (value.label) return <span className="text-xs font-medium text-slate-700">{value.label}</span>;
      return <span className="text-[10px] font-mono text-slate-400">{JSON.stringify(value)}</span>;
    }
    
    return <span className="text-xs font-medium text-slate-700 line-clamp-2" title={String(value)}>{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-100/30 p-4 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 -mr-32 -mt-32 rounded-full" />
        
        <div className="flex items-center gap-6 relative z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.close()}
            className="rounded-2xl h-11 w-11 bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-slate-100"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Version Timeline</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Full Snapshot History</p>
            </div>
          </div>
        </div>

        {bugDetails && (
          <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-2.5 rounded-2xl border border-indigo-100 relative z-10">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Currently Viewing</span>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-black text-indigo-700">{bugDetails.bugId}</span>
                   <div className="w-1 h-1 rounded-full bg-indigo-200" />
                   <span className="text-xs font-bold text-slate-600 max-w-[200px] truncate">{bugDetails.phaseI_BugReport?.toolInfo?.toolName}</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <Card className="flex-1 flex flex-col bg-white border-slate-200 shadow-xl rounded-[2.5rem] overflow-hidden">
        {/* Table Header Info */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <Calendar className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recorded Versions: {snapshots.length}</span>
              </div>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span>Highlighted cells indicate changes at that timestamp</span>
           </div>
        </div>

        <div className="flex-1 overflow-auto relative custom-scrollbar">
          {loading ? (
             <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50" />)}
             </div>
          ) : (
            <Table className="border-collapse min-w-max">
              <TableHeader className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">
                <TableRow className="hover:bg-transparent border-b border-slate-100">
                  {ALL_COLUMNS.map((col) => (
                    <TableHead 
                      key={col.key} 
                      className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-50"
                      style={{ width: col.width }}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.length > 0 ? (
                  snapshots.map((snap, sIdx) => (
                    <TableRow key={snap._id} className="group hover:bg-slate-50/30 transition-all border-b border-slate-50 last:border-0">
                      {/* Data Cells */}
                      {ALL_COLUMNS.map((col) => {
                        const isChanged = snap.changedFields.includes(col.key);
                        return (
                          <TableCell 
                            key={col.key} 
                            className={`p-4 border-r border-slate-200 transition-all ${
                              isChanged ? 'bg-yellow-100/80 !text-black shadow-inner border-y-yellow-400/30' : ''
                            }`}
                          >
                            <div className={isChanged ? 'font-bold' : ''}>
                               {renderCellContent(col.key, snap.state[col.key])}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={ALL_COLUMNS.length} className="h-48 text-center bg-slate-50/50">
                      <div className="flex flex-col items-center gap-3">
                         <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Info className="w-6 h-6 text-slate-300" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-400 tracking-tight">No Log History Found</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">This bug has not been updated yet</p>
                         </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
          border: 2px solid #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
