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
            className={`w-full flex items-center rounded-xl  gap-3 px-5 py-3.5 my-1 text-left transition-all duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-600 font-medium border border-[#739bdf]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            } ${index !== 0 ? "" : ""}`}
          >
            <Icon
              className={`w-[18px] h-[18px] flex-shrink-0 ${
                isActive ? "text-blue-600" : "text-gray-400"
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
