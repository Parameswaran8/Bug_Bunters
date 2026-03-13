import React from "react";
import { Bolt, User, Lock } from "lucide-react";

const SettingMenu = ({ activeTab, setActiveTab, setMobileMenuOpen }) => {
  console.log("activeTab in MenuContent:", activeTab);
  const menuItems = [
    { id: "users", label: "Users", icon: Bolt },
    { id: "tools", label: "Tools", icon: User },
    { id: "report", label: "Report", icon: Lock },
  ];

  return (
    <>
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center rounded-xl gap-3 px-4 py-3 my-1.5 text-left transition-all duration-300 ease-in-out ${
              isActive
                ? "bg-blue-600 shadow-md text-white font-medium shadow-blue-500/20 translate-x-1"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5"
            }`}
          >
            <Icon
              className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                isActive ? "text-white" : "text-slate-400"
              }`}
            />
            <span className="text-[15px]">{item.label}</span>
          </button>
        );
      })}
    </>
  );
};

export default SettingMenu;
