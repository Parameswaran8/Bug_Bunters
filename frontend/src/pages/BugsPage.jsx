import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  filterBugsForRaiser,
  filterBugsForTester,
  filterBugsForDev,
} from "@/utils/bugRoleFilter";
import CreateBug from "../components/Phases/PhaseI/CreateBug";
import BugTesting from "../components/Phases/PhaseII/BugTesting";
import AnalyzeBug from "../components/Phases/PhaseIII/BugAnalyze";
import ReadyToTest from "../components/Phases/PhaseIV/ReadyToTesting";
import ReadyToDeploy from "../components/Phases/PhaseV/ReadyToDeploy";
import Deployed from "../components/Phases/PhaseVI/Deployed";
import AllBugsStage from "../components/Phases/Shared/AllBugsStage";
import {
  LayoutGrid,
  Bug as BugIconLucide,
  TestTube2,
  Microscope,
  CheckCircle2,
  Rocket,
  BadgeCheck as DeployedIcon,
} from "lucide-react";

const RAW_PHASES = [
  {
    id: "all",
    label: "All Bugs",
    shortLabel: "All",
    icon: LayoutGrid,
    color: "#3b82f6",
    component: AllBugsStage,
    phaseStr: "All",
  },
  {
    id: "create",
    label: "New Bug",
    shortLabel: "New",
    icon: BugIconLucide,
    color: "#06b6d4",
    component: CreateBug,
    phaseStr: "Bug Reported",
  },
  {
    id: "testing",
    label: "Bug Testing",
    shortLabel: "Testing",
    icon: TestTube2,
    color: "#6366f1",
    component: BugTesting,
    phaseStr: "Bug Testing",
  },
  {
    id: "analyze",
    label: "Analyze Bug",
    shortLabel: "Analyze",
    icon: Microscope,
    color: "#8b5cf6",
    component: AnalyzeBug,
    phaseStr: "Bug Analysis",
  },
  {
    id: "rtt",
    label: "Ready to Test",
    shortLabel: "Rdy Test",
    icon: CheckCircle2,
    color: "#f59e0b",
    component: ReadyToTest,
    phaseStr: "Ready to Test",
  },
  {
    id: "rtd",
    label: "Ready to Deploy",
    shortLabel: "Rdy Deploy",
    icon: Rocket,
    color: "#f97316",
    component: ReadyToDeploy,
    phaseStr: "Ready to Deploy",
  },
  {
    id: "deployed",
    label: "Deployed",
    shortLabel: "Live",
    icon: DeployedIcon,
    color: "#10b981",
    component: Deployed,
    phaseStr: "Closure",
  },
];

function getUserRoleFlags(user) {
  if (!user)
    return {
      isAdmin: false,
      isBugRaiser: false,
      isTester: false,
      isDev: false,
    };
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  const roleArr = Array.isArray(user.roletype)
    ? user.roletype
    : user.roletype
      ? [user.roletype]
      : [];
  const isBugRaiser = roleArr.includes("bugreporter");
  const isTester = roleArr.includes("tester");
  const isDev = roleArr.includes("dev");
  return { isAdmin, isBugRaiser, isTester, isDev };
}

function getVisiblePhases(user) {
  const { isAdmin, isBugRaiser, isTester, isDev } = getUserRoleFlags(user);

  if (isAdmin) return RAW_PHASES;

  const allowedIds = new Set(["all"]);

  if (isBugRaiser) {
    ["create", "deployed"].forEach((id) => allowedIds.add(id));
  }
  if (isTester) {
    ["create", "testing", "rtt", "deployed"].forEach((id) =>
      allowedIds.add(id),
    );
  }
  if (isDev) {
    ["analyze", "rtd", "deployed"].forEach((id) => allowedIds.add(id));
  }

  return RAW_PHASES.filter((p) => allowedIds.has(p.id));
}

function getDefaultActiveTab(user, visiblePhases) {
  const { isAdmin, isBugRaiser, isTester, isDev } = getUserRoleFlags(user);
  const ids = visiblePhases.map((p) => p.id);

  if (isAdmin || isTester) return ids.includes("all") ? "all" : ids[0];
  if (isBugRaiser && !isTester && !isDev)
    return ids.includes("create") ? "create" : ids[0];
  if (isDev && !isBugRaiser && !isTester)
    return ids.includes("analyze") ? "analyze" : ids[0];
  return ids[0];
}

export default function BugsPage() {
  const { bugsList, user } = useAuth();

  const PHASES = getVisiblePhases(user);
  const defaultTab = getDefaultActiveTab(user, PHASES);

  const [active, setActive] = useState(defaultTab);
  const current = PHASES.find((p) => p.id === active) || PHASES[0];
  const ActiveComponent = current?.component;

  const getPhaseCount = (phaseStr) => {
    if (!bugsList) return 0;

    if (phaseStr === "All") return bugsList.length;

    let phaseBugs;
    if (phaseStr === "Bug Reported") {
      phaseBugs = bugsList.filter((b) => b.currentPhase === "Bug Reported");
      return filterBugsForRaiser(phaseBugs, user).length;
    }
    if (phaseStr === "Bug Testing") {
      phaseBugs = bugsList.filter(
        (b) =>
          b.currentPhase === "Bug Testing" ||
          b.currentPhase === "Bug Confirmation",
      );
      return filterBugsForTester(phaseBugs, user).length;
    }
    if (phaseStr === "Bug Analysis") {
      phaseBugs = bugsList.filter((b) => b.currentPhase === "Bug Analysis");
      return filterBugsForDev(phaseBugs, user).length;
    }
    if (phaseStr === "Ready to Test") {
      phaseBugs = bugsList.filter(
        (b) =>
          b.currentPhase === "Ready to Test" ||
          b.currentPhase === "Maintenance",
      );
      return filterBugsForTester(phaseBugs, user).length;
    }
    if (phaseStr === "Ready to Deploy") {
      phaseBugs = bugsList.filter(
        (b) =>
          b.currentPhase === "Ready to Deploy" ||
          b.currentPhase === "Final Testing",
      );
      return filterBugsForDev(phaseBugs, user).length;
    }
    return bugsList.filter((b) => b.currentPhase === phaseStr).length;
  };

  return (
    <div className="flex flex-col min-h-full gap-4">
      {/* ═══ Page title row ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Bugs
          </h1>
        </div>
      </div>

      {/* ═══ Horizontal scrollable phase tab bar ═══ */}
      <div
        className="flex items-stretch gap-2 overflow-x-auto pb-1 flex-shrink-0"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {PHASES.map((phase) => {
          const isActive = phase.id === active;
          return (
            <button
              key={phase.id}
              onClick={() => setActive(phase.id)}
              className="relative flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 group overflow-hidden"
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${phase.color}dd, ${phase.color}aa)`,
                      color: "#fff",
                      boxShadow: `0 6px 20px ${phase.color}40`,
                      transform: "translateY(-1px)",
                    }
                  : {
                      background: "#fff",
                      color: "#64748b",
                      border: "1.5px solid #e2e8f0",
                    }
              }
            >
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0 transition-colors"
                style={
                  isActive
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "#f1f5f9", color: "#94a3b8" }
                }
              >
                {getPhaseCount(phase.phaseStr)}
              </span>

              <phase.icon size={18} className="flex-shrink-0" />
              <span className="hidden sm:inline">{phase.label}</span>
              <span className="sm:hidden">{phase.shortLabel}</span>

              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Content card ═══ */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 overflow-auto flex-1">
          {ActiveComponent && <ActiveComponent />}
        </div>
        
        {active === "deployed" && (
          <div className="py-2.5 text-center bg-red-50/30 border-t border-red-100/50">
            <p className="text-[10px] text-red-500 font-semibold italic uppercase tracking-wider">
              Note: Data will no longer be visible here after 15 days of deployment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
