import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthContainer from "./components/Authorization/AuthContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/Dashboard/DashboardLayout";
import Dashboard from "./pages/Dashboard";
// import AssignBug from "./pages/AssignBug";
// import Testing from "./pages/Testing";
import Settings from "./pages/Settings";
import "./App.css";
import CreateBug from "./components/Phases/PhaseI/CreateBug";
import BugTesting from "./components/Phases/PhaseII/BugTesting";
import AnalyzeBug from "./components/Phases/PhaseIII/BugAnalyze";
import ReadyToTesting from "./components/Phases/PhaseIV/ReadyToTesting";
import ReadyToDeploy from "./components/Phases/PhaseV/ReadyToDeploy";
import Deployed from "./components/Phases/PhaseVI/Deployed";
import Stared from "./pages/Stared";
import Account from "./pages/Account";

function App() {
  return (
    <AuthProvider>
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
            <Route path="star" element={<Stared />} />
            <Route path="create-bug" element={<CreateBug />} />
            <Route path="bug-testing" element={<BugTesting />} />
            <Route path="analyze-bug" element={<AnalyzeBug />} />

            <Route path="ready-to-testing" element={<ReadyToTesting />} />
            <Route path="ready-to-deploy" element={<ReadyToDeploy />} />
            <Route path="deployed" element={<Deployed />} />
            <Route path="account" element={<Account />} />

            {/* <Route path="assign-bug" element={<AssignBug />} /> */}
            {/* <Route path="testing" element={<TestTube />} /> */}
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
