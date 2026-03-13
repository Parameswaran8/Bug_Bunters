import { useAuth } from "@/context/AuthContext";

/* ─── Static demo data ─── */
const STATS = [
  {
    label: "Total Bugs",
    value: 24,
    delta: "+3 this week",
    up: true,
    icon: "🐛",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    label: "In Progress",
    value: 9,
    delta: "+2 today",
    up: true,
    icon: "⚙️",
    color: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    label: "Resolved",
    value: 8,
    delta: "+1 today",
    up: true,
    icon: "✅",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    label: "Assigned",
    value: 12,
    delta: "No change",
    up: null,
    icon: "👤",
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    label: "Ready to Deploy",
    value: 5,
    delta: "+2 this week",
    up: true,
    icon: "🚀",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  {
    label: "Deployed",
    value: 3,
    delta: "All stable",
    up: null,
    icon: "🟢",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    text: "text-teal-600",
  },
];

const PIPELINE = [
  { phase: "New Bug", count: 24, color: "bg-cyan-500", pct: 100 },
  { phase: "Testing", count: 18, color: "bg-indigo-500", pct: 75 },
  { phase: "Analysis", count: 14, color: "bg-violet-500", pct: 58 },
  { phase: "Ready to Test", count: 10, color: "bg-orange-500", pct: 42 },
  { phase: "Ready to Deploy", count: 5, color: "bg-amber-500", pct: 21 },
  { phase: "Deployed", count: 3, color: "bg-emerald-500", pct: 12 },
];

const ACTIVITY = [
  { id: 1, type: "new",      label: "New bug created",         detail: "Login page crash on Safari", time: "2m ago",   avatar: "P" },
  { id: 2, type: "resolved", label: "Bug resolved",            detail: "Dashboard layout overflow", time: "18m ago",  avatar: "A" },
  { id: 3, type: "assigned", label: "Bug assigned",            detail: "API timeout on search",     time: "1h ago",   avatar: "R" },
  { id: 4, type: "deploy",   label: "Deployed to production",  detail: "v1.4.2 — Payment module",   time: "3h ago",   avatar: "M" },
  { id: 5, type: "new",      label: "New bug created",         detail: "Missing 404 error page",    time: "5h ago",   avatar: "S" },
];

const QUICK_ACTIONS = [
  { label: "New Bug",        href: "/create-bug",       icon: "🐛", color: "bg-cyan-500 hover:bg-cyan-600" },
  { label: "Bug Testing",    href: "/bug-testing",      icon: "🧪", color: "bg-indigo-500 hover:bg-indigo-600" },
  { label: "Analyze",        href: "/analyze-bug",      icon: "🔬", color: "bg-violet-500 hover:bg-violet-600" },
  { label: "Deploy",         href: "/ready-to-deploy",  icon: "🚀", color: "bg-orange-500 hover:bg-orange-600" },
];

const TEAM = [
  { name: "Param Eswaran",  role: "Admin",      bugs: 9,  resolved: 5, avatar: "P" },
  { name: "Ananya R.",      role: "Dev",        bugs: 7,  resolved: 6, avatar: "A" },
  { name: "Rahul M.",       role: "QA",         bugs: 5,  resolved: 4, avatar: "R" },
  { name: "Meena S.",       role: "Dev",        bugs: 3,  resolved: 2, avatar: "M" },
];

const BADGE_COLORS = {
  new:      "bg-cyan-100 text-cyan-700",
  resolved: "bg-emerald-100 text-emerald-700",
  assigned: "bg-violet-100 text-violet-700",
  deploy:   "bg-orange-100 text-orange-700",
};

const AVATAR_COLORS = ["bg-cyan-500","bg-indigo-500","bg-violet-500","bg-orange-500","bg-teal-500"];

function Dashboard() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6 pb-8">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <a
          href="/create-bug"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
        >
          <span className="text-base">＋</span>
          New Bug
        </a>
      </div>

      {/* ── 6 KPI stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <span className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center text-base`}>
                {s.icon}
              </span>
              {s.up !== null && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.up ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                  {s.up ? "↑" : "—"}
                </span>
              )}
            </div>
            <div>
              <p className={`text-2xl font-extrabold ${s.text}`}>{s.value}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle row: Pipeline + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bug Pipeline (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Bug Pipeline</h2>
          <div className="space-y-3">
            {PIPELINE.map((p) => (
              <div key={p.phase} className="flex items-center gap-3">
                <p className="text-xs font-medium text-gray-500 w-32 flex-shrink-0">{p.phase}</p>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.color} transition-all duration-700`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-600 w-6 text-right">{p.count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-4">* Based on current sprint data</p>
        </div>

        {/* Quick Actions (1/3 width) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <a
                key={a.label}
                href={a.href}
                className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl text-white text-xs font-semibold transition-all duration-200 ${a.color} shadow-sm hover:shadow-md hover:-translate-y-0.5`}
              >
                <span className="text-2xl">{a.icon}</span>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Activity + Team ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {ACTIVITY.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[a.id % AVATAR_COLORS.length]}`}>
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[a.type]}`}>
                      {a.label}
                    </span>
                    <span className="text-xs text-gray-400">{a.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mt-0.5 truncate">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Leaderboard (1/3 width) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Team Overview</h2>
          <div className="space-y-3">
            {TEAM.map((member, i) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-cyan-600">{member.bugs} bugs</p>
                  <p className="text-xs text-emerald-500">{member.resolved} fixed</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
            <span>Total tracked</span>
            <span className="font-bold text-gray-600">24 bugs</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
