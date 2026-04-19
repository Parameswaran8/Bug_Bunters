import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/API_Call/Auth";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Bug,
  Settings,
  LogOut,
  BugIcon,
  ChevronDown,
  ChevronRight,
  Users,
  Wrench,
  FileBarChart,
} from "lucide-react";

const NAV = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Work",
    items: [{ name: "Bugs", href: "/bugs", icon: Bug }],
  },
  {
    label: "Admin",
    items: [
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        subItems: [
          { name: "Users", href: "/settings/users", icon: Users },
          { name: "Tools", href: "/settings/tools", icon: Wrench },
          { name: "Reports", href: "/settings/reports", icon: FileBarChart },
        ],
      },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, setUser, setLoading } = useAuth();
  const [expanded, setExpanded] = useState({ Settings: true });
  
  const toggleExpand = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const hasSettingsAccess = user?.role === "superadmin" || (Array.isArray(user?.adminControl) && user.adminControl.some(r => ["create", "edit", "view", "delete"].includes(r?.toLowerCase())));

  const handleLogout = async () => {
    setLoading(true);
    const res = await logout();
    if (res.success) {
      setUser("");
      toast.success("Logged out");
      navigate("/login");
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  const initial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "U";

  const isActive = (href) => {
    if (href === "/settings") return pathname.startsWith("/settings");
    if (href === "/bugs") return pathname.startsWith("/bugs");
    return pathname === href;
  };

  return (
    <aside
      className="relative flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
      style={{
        width: collapsed ? "64px" : "220px",
        background: "linear-gradient(165deg, #071e2e 0%, #0a2d44 50%, #071e2e 100%)",
        borderRight: "1px solid rgba(6,182,212,0.12)",
      }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", transform: "translate(-40%,-40%)" }} />
      <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", transform: "translate(40%,40%)" }} />

      {/* ── Brand header ── */}
      <div className={`flex items-center h-14 flex-shrink-0 px-3 ${collapsed ? "justify-center" : "gap-3 px-4"}`}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)" }}
        >
          <BugIcon size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-none whitespace-nowrap">Bug Tracker</p>
            <p className="text-cyan-400/60 text-[10px] mt-0.5 whitespace-nowrap">by CEOITBOX</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)" }} />

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2" style={{ scrollbarWidth: "none" }}>
        {NAV.map((group) => {
          if (group.label === "Admin" && !hasSettingsAccess) return null;
          return (
          <div key={group.label} className="mb-1">
            {/* Section label — only when expanded */}
            {!collapsed && (
              <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-widest uppercase select-none"
                style={{ color: "rgba(103,232,249,0.35)" }}>
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-3" />}

            {group.items.map((item) => {
              const active = isActive(item.href);
              const isExpanded = expanded[item.name];
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.name}>
                  <div
                    onClick={hasSubItems ? () => toggleExpand(item.name) : () => navigate(item.href)}
                    className="group relative flex items-center rounded-xl mb-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: collapsed ? 0 : "0.75rem",
                      padding: collapsed ? "0.625rem" : "0.625rem 0.75rem",
                      ...(active && !hasSubItems ? {
                        background: "linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0.08) 100%)",
                        borderLeft: collapsed ? "none" : "3px solid #22d3ee",
                        borderRadius: collapsed ? "12px" : undefined,
                        boxShadow: collapsed ? "0 0 0 1.5px rgba(34,211,238,0.5)" : "none",
                      } : {
                        borderLeft: collapsed ? "none" : "3px solid transparent",
                      }),
                    }}
                  >
                    {active && !hasSubItems && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at left center, rgba(6,182,212,0.15) 0%, transparent 60%)" }} />
                    )}

                    <item.icon
                      size={18}
                      className="flex-shrink-0 relative z-10 transition-colors duration-200"
                      style={{ color: active ? "#22d3ee" : "rgba(186,230,253,0.55)" }}
                    />

                    {!collapsed && (
                      <span className="text-sm font-medium truncate relative z-10"
                        style={{ color: active ? "#e0f2fe" : "rgba(186,230,253,0.7)" }}>
                        {item.name}
                      </span>
                    )}

                    {hasSubItems && !collapsed && (
                      <span className="ml-auto relative z-10">
                        {isExpanded ? <ChevronDown size={14} className="text-cyan-400/50" /> : <ChevronRight size={14} className="text-cyan-400/50" />}
                      </span>
                    )}

                    {active && !hasSubItems && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 relative z-10"
                        style={{ background: "#22d3ee", boxShadow: "0 0 6px #22d3ee" }} />
                    )}
                  </div>

                  {/* Sub items */}
                  {hasSubItems && isExpanded && !collapsed && (
                    <div className="ml-4 pl-4 border-l border-cyan-900/50 space-y-0.5 mt-1 mb-2">
                      {item.subItems.map((sub) => {
                        const subActive = pathname === sub.href;
                        return (
                          <a
                            key={sub.name}
                            href={sub.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200"
                            style={{
                              background: subActive ? "rgba(6,182,212,0.1)" : "transparent",
                            }}
                          >
                            <sub.icon size={14} style={{ color: subActive ? "#22d3ee" : "rgba(186,230,253,0.4)" }} />
                            <span className="text-xs font-medium" style={{ color: subActive ? "#e0f2fe" : "rgba(186,230,253,0.6)" }}>
                              {sub.name}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)" }} />

      {/* ── User footer ── */}
      <div
        className={`flex items-center py-4 flex-shrink-0 ${collapsed ? "justify-center px-3" : "gap-3 px-3"}`}
      >
        <button
          onClick={() => navigate("/account")}
          title={user?.name}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)" }}
        >
          {initial}
        </button>

        {!collapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white/90 truncate leading-none">{user?.name}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(103,232,249,0.5)" }}>
                {user?.email || user?.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-all"
            >
              <LogOut size={14} style={{ color: "rgba(248,113,113,0.7)" }} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
