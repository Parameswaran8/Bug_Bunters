import { useState } from "react";
import CreateBug     from "../components/Phases/PhaseI/CreateBug";
import BugTesting    from "../components/Phases/PhaseII/BugTesting";
import AnalyzeBug    from "../components/Phases/PhaseIII/BugAnalyze";
import ReadyToTest   from "../components/Phases/PhaseIV/ReadyToTesting";
import ReadyToDeploy from "../components/Phases/PhaseV/ReadyToDeploy";
import Deployed      from "../components/Phases/PhaseVI/Deployed";

const PHASES = [
  { id: "create",   label: "New Bug",        shortLabel: "New",      icon: "🐛", color: "#06b6d4", component: CreateBug },
  { id: "testing",  label: "Bug Testing",    shortLabel: "Testing",  icon: "🧪", color: "#6366f1", component: BugTesting },
  { id: "analyze",  label: "Analyze Bug",    shortLabel: "Analyze",  icon: "🔬", color: "#8b5cf6", component: AnalyzeBug },
  { id: "rtt",      label: "Ready to Test",  shortLabel: "Rdy Test", icon: "☁️", color: "#f59e0b", component: ReadyToTest },
  { id: "rtd",      label: "Ready to Deploy",shortLabel: "Rdy Deploy",icon: "🚀", color: "#f97316", component: ReadyToDeploy },
  { id: "deployed", label: "Deployed",       shortLabel: "Live",     icon: "✅", color: "#10b981", component: Deployed },
];

export default function BugsPage() {
  const [active, setActive] = useState("create");
  const current = PHASES.find((p) => p.id === active);
  const ActiveComponent = current?.component;
  const activeIdx = PHASES.findIndex((p) => p.id === active);

  return (
    <div className="flex flex-col min-h-full gap-4">

      {/* ═══ Page title row ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Bugs</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Phase {activeIdx + 1} of {PHASES.length} — <span className="font-semibold text-gray-500">{current?.label}</span>
          </p>
        </div>

        {/* Phase progress pills */}
        <div className="flex items-center gap-1.5">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              title={p.label}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                background: p.id === active ? p.color : "#e2e8f0",
                transform: p.id === active ? "scale(1.5)" : "scale(1)",
                boxShadow: p.id === active ? `0 0 6px ${p.color}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══ Horizontal scrollable phase tab bar ═══ */}
      <div
        className="flex items-stretch gap-2 overflow-x-auto pb-1 flex-shrink-0"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {PHASES.map((phase, idx) => {
          const isActive = phase.id === active;
          return (
            <button
              key={phase.id}
              onClick={() => setActive(phase.id)}
              className="relative flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 group overflow-hidden"
              style={isActive ? {
                background: `linear-gradient(135deg, ${phase.color}dd, ${phase.color}aa)`,
                color: "#fff",
                boxShadow: `0 6px 20px ${phase.color}40`,
                transform: "translateY(-1px)",
              } : {
                background: "#fff",
                color: "#64748b",
                border: "1.5px solid #e2e8f0",
              }}
            >
              {/* Number badge */}
              <span
                className="w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                style={isActive
                  ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                  : { background: "#f1f5f9", color: "#94a3b8" }
                }
              >
                {idx + 1}
              </span>

              <span className="text-base leading-none">{phase.icon}</span>

              {/* Full label on md+, short on small */}
              <span className="hidden sm:inline">{phase.label}</span>
              <span className="sm:hidden">{phase.shortLabel}</span>

              {/* Active bottom bar */}
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
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header strip */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
          style={{ background: `linear-gradient(90deg, ${current?.color}0d, transparent)` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: current?.color, boxShadow: `0 0 6px ${current?.color}` }}
            />
            <span className="text-sm font-semibold text-gray-700">{current?.label}</span>
          </div>

          {/* Prev / Next navigation buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActive(PHASES[Math.max(0, activeIdx - 1)].id)}
              disabled={activeIdx === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: activeIdx === 0 ? "#f1f5f9" : `${current?.color}18`,
                color: activeIdx === 0 ? "#94a3b8" : current?.color,
                border: `1.5px solid ${activeIdx === 0 ? "#e2e8f0" : current?.color + "40"}`,
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => setActive(PHASES[Math.min(PHASES.length - 1, activeIdx + 1)].id)}
              disabled={activeIdx === PHASES.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: activeIdx === PHASES.length - 1 ? "#f1f5f9" : `${current?.color}18`,
                color: activeIdx === PHASES.length - 1 ? "#94a3b8" : current?.color,
                border: `1.5px solid ${activeIdx === PHASES.length - 1 ? "#e2e8f0" : current?.color + "40"}`,
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Phase component */}
        <div className="p-5 overflow-auto">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}
