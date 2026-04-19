import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Bug, 
  Settings, 
  CheckCircle2, 
  User as UserIcon, 
  Rocket, 
  AlertCircle,
  Clock,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

function Dashboard() {
  const { bugsList, allUsers, user } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = useMemo(() => {
    if (!bugsList) return { total: 0, inProgress: 0, resolved: 0, urgent: 0, unassigned: 0, myTasks: 0, today: 0 };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return {
      total: bugsList.length,
      inProgress: bugsList.filter(b => ["Bug Testing", "Bug Analysis", "Ready to Test", "Maintenance"].includes(b.currentPhase)).length,
      resolved: bugsList.filter(b => ["Ready to Deploy", "Final Testing", "Closure"].includes(b.currentPhase)).length,
      urgent: bugsList.filter(b => b.phaseI_BugReport?.toolInfo?.priority === "Urgent").length,
      unassigned: bugsList.filter(b => !b.phaseII_BugConfirmation?.assignedDeveloper && !b.phaseI_BugReport?.assignedTester).length,
      myTasks: bugsList.filter(b => 
        (b.phaseII_BugConfirmation?.assignedDeveloper === user?._id) || 
        (b.phaseI_BugReport?.reportedBy === user?._id && b.currentPhase === "Bug Reported")
      ).length,
      today: bugsList.filter(b => new Date(b.createdAt) >= todayStart).length
    };
  }, [bugsList, user]);

  const stackStats = useMemo(() => {
    if (!bugsList) return [];
    const counts = {};
    bugsList.forEach(b => {
      const s = b.phaseI_BugReport?.toolInfo?.stack || "Other";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: (count / bugsList.length) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bugsList]);

  const toolStats = useMemo(() => {
    if (!bugsList) return [];
    const counts = {};
    bugsList.forEach(b => {
      const t = b.phaseI_BugReport?.toolInfo?.toolName || "Unknown";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bugsList]);

  const pipeline = useMemo(() => {
    if (!bugsList) return [];
    const phases = [
      { id: "reported", label: "Reported", color: "bg-cyan-500", key: "Bug Reported" },
      { id: "testing", label: "Testing", color: "bg-indigo-500", key: "Bug Testing" },
      { id: "analysis", label: "Analysis", color: "bg-violet-500", key: "Bug Analysis" },
      { id: "rtt", label: "Ready to Test", color: "bg-orange-500", key: "Ready to Test" },
      { id: "rtd", label: "Ready to Deploy", color: "bg-amber-500", key: "Ready to Deploy" },
      { id: "closure", label: "Closure", color: "bg-emerald-500", key: "Closure" }
    ];

    return phases.map(p => {
      const count = bugsList.filter(b => b.currentPhase === p.key).length;
      return { ...p, count, pct: (count / (bugsList.length || 1)) * 100 };
    });
  }, [bugsList]);

  const priorities = useMemo(() => {
    if (!bugsList) return [];
    const levels = [
      { label: "Urgent", color: "bg-rose-500", text: "text-rose-500" },
      { label: "High", color: "bg-orange-500", text: "text-orange-500" },
      { label: "Medium", color: "bg-amber-500", text: "text-amber-500" },
      { label: "Low", color: "bg-emerald-500", text: "text-emerald-500" }
    ];

    return levels.map(l => {
      const count = bugsList.filter(b => b.phaseI_BugReport?.toolInfo?.priority === l.label).length;
      return { ...l, count, pct: (count / (bugsList.length || 1)) * 100 };
    });
  }, [bugsList]);

  const recentActivity = useMemo(() => {
    if (!bugsList) return [];
    return [...bugsList]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6);
  }, [bugsList]);

  const teamStats = useMemo(() => {
    if (!allUsers || !bugsList) return [];
    return allUsers
      .map(u => {
        const assigned = bugsList.filter(b => 
          b.phaseII_BugConfirmation?.assignedDeveloper === u.id || 
          b.phaseI_BugReport?.assignedTester === u.id
        ).length;
        const resolved = bugsList.filter(b => 
          (b.phaseVII_Closure?.closedBy === u.id) || 
          (b.currentPhase === "Closure" && b.phaseII_BugConfirmation?.assignedDeveloper === u.id)
        ).length;
        return { ...u, assigned, resolved };
      })
      .filter(u => u.assigned > 0)
      .sort((a, b) => b.assigned - a.assigned)
      .slice(0, 5);
  }, [allUsers, bugsList]);

  const canReport = useMemo(() => {
    if (!user) return false;
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    const roleArr = Array.isArray(user.roletype) ? user.roletype : (user.roletype ? [user.roletype] : []);
    return roleArr.includes("bugreporter") || isAdmin;
  }, [user]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1.5">
              <Activity size={12} /> Live Updates
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
            <Clock size={14} className="text-slate-300" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/bugs"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <LayoutGrid size={18} />
            View All Bugs
          </Link>
          {canReport && (
            <Link
              to="/bugs"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
            >
              <span className="text-lg">＋</span>
              New Bug
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI Stat Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Bugs", value: stats.total, icon: Bug, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", delta: `${stats.today} new today` },
          { label: "In Progress", value: stats.inProgress, icon: Settings, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", delta: "Active cycle" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", delta: "Master record" },
          { label: "Urgent", value: stats.urgent, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", delta: "Immediate focus" },
          { label: "Unassigned", value: stats.unassigned, icon: UserIcon, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", delta: "Pending triage" },
          { label: "My Tasks", value: stats.myTasks, icon: Rocket, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", delta: "Current workload" },
        ].map((item, idx) => (
          <div key={idx} className={`bg-white rounded-[24px] border ${item.border} p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}>
             <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-slate-50/50 group-hover:scale-110 transition-transform duration-500" />
             <div className="relative z-10 flex flex-col h-full justify-between gap-4">
               <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} shadow-sm border border-white/50`}>
                 <item.icon size={22} strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-3xl font-black text-slate-800 tracking-tight">{item.value}</p>
                 <div className="flex flex-col">
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                   <p className="text-[10px] font-semibold text-slate-300 italic mt-0.5">{item.delta}</p>
                 </div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* ── Advanced Insights Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Tech Stack Distribution */}
         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-7">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
               Tech Stack Distribution
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {stackStats.map((s, i) => (
                 <div key={i} className="p-4 rounded-[20px] bg-slate-50/50 border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{s.name}</span>
                       <span className="text-xs font-black text-indigo-600">{s.count}</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden p-0.5 border border-slate-200">
                       <div className="h-full bg-indigo-500 rounded-full shadow-sm" style={{ width: `${s.pct}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Project Hotspots */}
         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-7">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
               Project Hotspots
            </h2>
            <div className="flex flex-wrap gap-2">
               {toolStats.map((t, i) => (
                 <div key={i} className="px-4 py-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-default group">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                      i === 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                    }`}>
                      #{i + 1}
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-700">{t.name}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover:text-rose-500 transition-colors">{t.count} Active Bugs</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Bug Pipeline Analysis */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-7">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Lifecycle Pipeline</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Tracking bugs across operational phases</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <TrendingUp size={14} className="text-emerald-500" />
                Real-time Distribution
              </div>
            </div>
            
            <div className="space-y-6">
              {pipeline.map((p) => (
                <div key={p.id} className="group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{p.count}</span>
                      <span className="text-[10px] font-bold text-slate-300">{Math.round(p.pct)}%</span>
                    </div>
                  </div>
                  <div className="h-3.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className={`h-full rounded-full ${p.color} shadow-sm transition-all duration-1000 ease-out`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Priority Breakdown */}
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-7">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Priority Mix</h2>
                <div className="flex h-12 gap-1 rounded-2xl overflow-hidden mb-8 border-4 border-slate-50">
                  {priorities.map((l, i) => l.count > 0 && (
                    <div 
                      key={i} 
                      className={`${l.color} h-full transition-all duration-700 hover:opacity-80`}
                      style={{ width: `${l.pct}%` }}
                      title={`${l.label}: ${l.count} bugs`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {priorities.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 bg-slate-50/30">
                      <div className={`w-2 h-8 rounded-full ${l.color}`} />
                      <div>
                        <p className="text-xs font-black text-slate-800">{l.count}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-tight ${l.text}`}>{l.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Team Spotlight */}
             <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-7">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Resource Allocation</h2>
                <div className="space-y-4">
                  {teamStats.length > 0 ? teamStats.map((member, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
                        {member.avatar ? (
                           <span className="bg-indigo-500 text-white w-full h-full flex items-center justify-center uppercase">{member.name.charAt(0)}</span>
                        ) : (
                          <UserIcon size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{member.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className="flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                             <span className="text-[10px] font-bold text-slate-400">{member.assigned} Assigned</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-bold text-slate-400">{member.resolved} Fixed</span>
                           </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-300">
                       <UserIcon size={32} className="mb-2 opacity-20" />
                       <p className="text-xs font-medium">No active assignments</p>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="p-7 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Live Activity</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Latest forensic updates from the field</p>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-1">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors group cursor-pointer">
                 <div className="relative">
                   <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                     <Bug size={20} />
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center">
                     <div className={`w-2.5 h-2.5 rounded-full ${
                       activity.phaseI_BugReport?.toolInfo?.priority === "Urgent" ? "bg-rose-500" :
                       activity.phaseI_BugReport?.toolInfo?.priority === "High" ? "bg-orange-500" : "bg-blue-400"
                     }`} />
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{activity.bugId}</span>
                     <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                       {new Date(activity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>
                   <p className="text-sm font-bold text-slate-700 mt-0.5 truncate group-hover:text-indigo-600 transition-colors">
                     {activity.phaseI_BugReport?.toolInfo?.bugDescription}
                   </p>
                   <div className="flex items-center gap-2 mt-1.5">
                     <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold">
                       {activity.currentPhase}
                     </span>
                     <span className="text-[10px] font-bold text-slate-300">•</span>
                     <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">
                       {activity.phaseI_BugReport?.toolInfo?.toolName}
                     </span>
                   </div>
                 </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-96 text-center text-slate-300">
                 <Activity size={48} className="mb-4 opacity-10" />
                 <p className="text-sm font-bold">No recent activities</p>
                 <p className="text-xs mt-1">Updates will appear as bugs are processed</p>
              </div>
            )}
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 rounded-b-[32px]">
             <Link to="/bugs" className="flex items-center justify-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
               Explore Full Master List
               <ChevronRight size={14} />
             </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
