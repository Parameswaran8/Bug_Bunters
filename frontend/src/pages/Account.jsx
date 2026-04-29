import { useState } from "react";
import General from "@/components/My_Account/General";
import AdminControl from "@/components/My_Account/Admin_Control";
import PasswordControl from "@/components/My_Account/Password";
import { Bolt, User, Lock, Bell } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Account() {
  const [activeTab, setActiveTab] = useState("general");

  const menuItems = [
    { id: "general", label: "General", icon: Bolt },
    { id: "admin", label: "Admin", icon: User },
    { id: "password", label: "Password", icon: Lock },
  ];

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* ── Header with Icon Tabs ── */}
      <header className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-bold text-gray-900">My Account</h4>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">
            {activeTab} Settings
          </p>
        </div>

        {/* Icon Navigation */}
        <TooltipProvider>
          <nav className="flex items-center bg-gray-100/50 p-1 rounded-xl">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white text-cyan-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                      }`}
                    >
                      <Icon size={20} className={isActive ? "text-cyan-600" : "text-gray-400"} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </header>

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-auto p-6 bg-white">
        <div className="max-w-4xl">
          {activeTab === "general" && <General />}
          {activeTab === "admin" && <AdminControl />}
          {activeTab === "password" && <PasswordControl />}
        </div>
      </main>
    </div>
  );
}

export default Account;
