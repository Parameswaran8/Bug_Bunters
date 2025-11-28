import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Menu, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import General from "@/components/My_Account/General";
import MenuContent from "@/components/My_Account/MenuContent";
import AdminControl from "@/components/My_Account/Admin_Control";
import PasswordControl from "@/components/My_Account/Password";
import NotificationControl from "@/components/My_Account/Notification";

function Account() {
  const [activeTab, setActiveTab] = useState("general");
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

  return (
    <div className="w-full h-[98%] bg-white relative  lg:border lg:!border-['#f3f3f3] rounded-xl">
      <div className="h-full mx-auto p-0 sm:p-1 lg:p-4">
        {/* Main Layout */}
        <div className="h-full flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <MenuContent
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
                  My Account
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

                  {/* Dropdown Menu */}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                <span className="font-medium">My Account</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-600">
                  {activeTab === "general"
                    ? "General"
                    : activeTab == "admin"
                    ? "Admin"
                    : activeTab === "password"
                    ? "Password"
                    : activeTab === "notification"
                    ? "Notification"
                    : null}
                </span>
              </div>
            </div>

            {activeTab === "general" ? (
              <General />
            ) : activeTab == "admin" ? (
              <AdminControl />
            ) : activeTab === "password" ? (
              <PasswordControl />
            ) : activeTab === "notification" ? (
              <NotificationControl />
            ) : null}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-72 z-40 shadow-lg top-1">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <MenuContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setMobileMenuOpen={setMobileMenuOpen}
              />
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

export default Account;
