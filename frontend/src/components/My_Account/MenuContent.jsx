import React from "react";
import {
  Bolt,
  User,
  CreditCard,
  Link2,
  Languages,
  Lock,
  Bell,
} from "lucide-react";

const MenuContent = ({ activeTab, setActiveTab, setMobileMenuOpen }) => {
  console.log("activeTab in MenuContent:", activeTab);
  const menuItems = [
    { id: "general", label: "General", icon: Bolt },
    { id: "admin", label: "Admin", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notification", label: "Notification", icon: Bell },
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

export default MenuContent;
