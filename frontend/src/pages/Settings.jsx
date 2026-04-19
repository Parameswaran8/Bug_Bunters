import { useState } from "react";
import { useParams } from "react-router-dom";
import { Shield, Search, UserPlus } from "lucide-react";
import UserManagment from "@/components/Settings/UserManagment";
import ToolManagment from "@/components/Settings/Tools/Tools";
import ReportControl from "@/components/Settings/Report";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function Settings() {
  const { user, allUsers } = useAuth();
  const { tab } = useParams();
  const activeTab = tab || "users";
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);

  const hasSettingsAccess = user?.role === "superadmin" || (Array.isArray(user?.adminControl) && user.adminControl.some(r => ["create", "edit", "view", "delete"].includes(r?.toLowerCase())));

  const canCreateUser = allUsers && (user?.role === "superadmin" || user?.adminControl?.includes("create"));

  if (!hasSettingsAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <Shield size={48} className="text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500">You don't have permission to access these settings.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 capitalize leading-tight">
            {activeTab === "reports" ? "System Reports" : `${activeTab} Management`}
          </h1>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
            Settings / {activeTab}
          </p>
        </div>

        {activeTab === "users" && (
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 border-gray-200 focus:border-cyan-500 focus:ring-cyan-50"
              />
            </div>
            {canCreateUser && (
              <Button 
                onClick={() => setIsUserSheetOpen(true)} 
                className="h-9 gap-2 bg-cyan-600 hover:bg-cyan-700 whitespace-nowrap"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Add User</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "users" && (
          <UserManagment 
            searchQuery={searchQuery} 
            isSheetOpen={isUserSheetOpen} 
            setIsSheetOpen={setIsUserSheetOpen} 
          />
        )}
        {activeTab === "tools" && <ToolManagment />}
        {activeTab === "reports" && <ReportControl />}
      </div>
    </div>
  );
}

export default Settings;
