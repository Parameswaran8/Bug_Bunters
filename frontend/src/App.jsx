import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AuthContainer from "./components/Authorization/AuthContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import BugsPage from "./pages/BugsPage";
import Settings from "./pages/Settings";
import "./App.css";
import Account from "./pages/Account";
import BugActivityLog from "./pages/BugActivityLog";

import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthContainer />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="bugs" element={<BugsPage />} />
            <Route path="bugs/:id/activity" element={<BugActivityLog />} />
            <Route path="account" element={<Account />} />
            <Route path="settings/:tab?" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
