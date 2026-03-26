import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Menu, Users, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SettingMenu from "@/components/Settings/SettingMenu";
import UserManagment from "@/components/Settings/UserManagment";
import ToolManagment from "@/components/Settings/Tools/Tools";
import ReportControl from "@/components/Settings/Report";
import { useAuth } from "@/context/AuthContext";

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasSettingsAccess = user?.role === "superadmin" || (Array.isArray(user?.adminControl) && user.adminControl.some(r => ["create", "edit", "view", "delete"].includes(r?.toLowerCase())));

  if (!hasSettingsAccess) {
    return (
      <div className="w-full h-[98%] bg-[#fdfdfd] relative rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden flex items-center justify-center">
        <div className="text-center p-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You have no access to view the content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[98%] bg-[#fdfdfd] relative rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      <div className="h-full mx-auto p-3 sm:p-4 lg:p-6 bg-white/50">
        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden lg:block w-40 xl:w-55 flex-shrink-0">
            <SettingMenu
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </aside>

          <Separator
            orientation="vertical"
            className="hidden lg:block h-auto self-stretch bg-gray-200 w-px"
          />

          {/* Right Content Area */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-4 px-3 lg:px-3">
              <div className="flex items-center justify-between  mb-0 lg:mb-2">
                <h4 className="text-lg lg:text-xl font-semibold text-gray-900">
                  Settings
                </h4>

                {/* Mobile Menu Button */}
                <div className="lg:hidden relative" ref={menuRef}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="relative z-30 border-none shadow-none bg-none"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <EllipsisVertical />
                      // <Menu className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Dropdown Menu directly inside menuRef so clicks aren't registered as outside */}
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 z-40 shadow-lg top-full">
                      <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden p-1">
                        <SettingMenu
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                          setMobileMenuOpen={setMobileMenuOpen}
                        />
                      </nav>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                <span className="font-medium">My Account</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-600">
                  {activeTab === "users"
                    ? "Users"
                    : activeTab == "tools"
                    ? "Tools"
                    : activeTab === "report"
                    ? "Report"
                    : null}
                </span>
              </div>
            </div>

            {activeTab === "users" ? (
              <UserManagment />
            ) : activeTab == "tools" ? (
              <ToolManagment />
            ) : activeTab === "report" ? (
              <ReportControl />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Settings;
