import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  ShieldCheck,
  Wrench,
  Key,
  AlertTriangle,
  BadgeCheck,
  Clock,
} from "lucide-react";

function roleColor(role) {
  const map = {
    superadmin: "bg-purple-100 text-purple-700 border-purple-200",
    admin:      "bg-cyan-100 text-cyan-700 border-cyan-200",
    bugreporter:"bg-blue-100 text-blue-700 border-blue-200",
    tester:     "bg-indigo-100 text-indigo-700 border-indigo-200",
    dev:        "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return map[role] || "bg-gray-100 text-gray-600 border-gray-200";
}

function roleLabel(r) {
  const map = {
    bugreporter: "Bug Reporter",
    tester:      "Tester",
    dev:         "Developer",
    admin:       "Admin",
    superadmin:  "Super Admin",
  };
  return map[r] || r;
}

function InfoRow({ label, value, icon: Icon, mono }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5 sm:w-44 flex-shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
        <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
          {label}
        </span>
      </div>
      <div className={`text-sm font-medium text-gray-800 ${mono ? "font-mono text-gray-500 text-xs" : ""}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function AdminControl() {
  const { user, allUsers, toolList } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const allRoles = [
    ...(user?.role ? [user.role] : []),
    ...(Array.isArray(user?.roletype)
      ? user.roletype
      : user?.roletype
      ? [user.roletype]
      : []),
  ];

  const uniqueRoles = [...new Set(allRoles)];

  return (
    <div className="space-y-5">
      {/* ── Account Authority Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-700">Account Authority</h3>
        </div>

        <InfoRow label="Account ID"  value={user?._id || user?.id} icon={Key} mono />
        <InfoRow label="Name"        value={user?.name} icon={BadgeCheck} />
        <InfoRow label="Username"    value={user?.username} icon={BadgeCheck} />
        <InfoRow label="Email"       value={user?.email} icon={BadgeCheck} />

        {/* Roles badges */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 sm:w-44 flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
              Assigned Roles
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueRoles.length > 0 ? (
              uniqueRoles.map((r) => (
                <span
                  key={r}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColor(r)}`}
                >
                  {roleLabel(r)}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">No roles assigned</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3">
          <div className="flex items-center gap-1.5 sm:w-44 flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
              Admin Access
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              isAdmin
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {isAdmin ? "✓ Granted" : "✗ Not an Admin"}
          </span>
        </div>
        
        {isAdmin && (
          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 sm:w-44 flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wide">
                Daily Report Time
              </span>
            </div>
            <div className="text-sm font-medium text-gray-800">
              8:00 PM
            </div>
          </div>
        )}
      </div>

      {/* ── System Stats (admin-only) ── */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-700">System Overview</h3>
            <span className="ml-auto text-xs text-gray-400">Admin only</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Total Users */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl p-4">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-cyan-700">
                {allUsers?.length ?? "—"}
              </p>
              <p className="text-xs font-semibold text-cyan-600 mt-0.5">Total Users</p>
            </div>

            {/* Total Tools */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4">
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center mb-3">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-violet-700">
                {toolList?.length ?? "—"}
              </p>
              <p className="text-xs font-semibold text-violet-600 mt-0.5">Registered Tools</p>
            </div>

            {/* Admins */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-700">
                {allUsers?.filter(
                  (u) => u.role === "admin" || u.role === "superadmin"
                ).length ?? "—"}
              </p>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Admins</p>
            </div>
          </div>

          {/* User role breakdown */}
          <div className="mt-5">
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-3">
              Role Breakdown
            </p>
            <div className="space-y-2">
              {["bugreporter", "tester", "dev"].map((r) => {
                const count =
                  allUsers?.filter((u) =>
                    Array.isArray(u.roletype)
                      ? u.roletype.includes(r)
                      : u.roletype === r
                  ).length ?? 0;
                const pct = allUsers?.length
                  ? Math.round((count / allUsers.length) * 100)
                  : 0;
                const colors = {
                  bugreporter: { bar: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50" },
                  tester:      { bar: "bg-indigo-500",  text: "text-indigo-700",  bg: "bg-indigo-50" },
                  dev:         { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
                };
                const c = colors[r];
                return (
                  <div key={r} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold w-28 ${c.text}`}>
                      {roleLabel(r)}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-500 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Non-admin notice */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Admin access required
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              System overview and admin controls are only visible to Admin and
              Super Admin accounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminControl;
