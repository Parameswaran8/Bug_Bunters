import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Bell, PanelLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";

import { NotificationPopover } from "./NotificationPopover";

function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Custom Sidebar — receives collapse state from here ── */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* ── Top Header Bar ── */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 bg-white border-b border-gray-100 px-4">
          {/* Left: toggle + greeting */}
          <div className="flex items-center gap-3">
            {/* Sidebar toggle in header */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-100 text-gray-500 hover:text-cyan-600"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft size={17} />
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">
                Hi, {user?.name?.split(" ")[0] ?? "there"} 👋
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Bug Bunters Platform</p>
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <NotificationPopover />
            <button
              onClick={() => navigate("/account")}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #0891b2, #0e7490)" }}
            >
              {user?.name?.[0] ?? "U"}
            </button>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main
          className="flex-1 overflow-auto p-5"
          style={{ background: "#f8fafc" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
