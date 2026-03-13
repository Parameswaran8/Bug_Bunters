"use client";

import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import PasswordReset from "./PasswordReset";
import "./AuthContainer.css";

/* ── Feature items shown on left decorative panel ── */
const FEATURES = [
  { icon: "🐛", title: "Bug Tracking", desc: "Report & track bugs end-to-end" },
  { icon: "📊", title: "Live Dashboard", desc: "Real-time insights & analytics" },
  { icon: "🔒", title: "Secure Access", desc: "Enterprise-grade data protection" },
];

/* ── Stat counters ── */
const STATS = [
  { value: "5k+", label: "Bugs Squashed" },
  { value: "200+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
];

function AuthContainer() {
  const [authMode, setAuthMode] = useState("login");

  const isRegister = authMode === "register";

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)" }}
    >
      {/* ── Subtle ambient blobs on light bg ── */}
      <div
        className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-60px] right-[-60px] w-60 h-60 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ══════════ Main Card ══════════ */}
      <div className="relative w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden bg-white flex min-h-[620px] z-10"
        style={{ boxShadow: "0 25px 60px rgba(8, 145, 178, 0.12), 0 8px 20px rgba(0,0,0,0.06)" }}
      >
        {/* ════════ LEFT PANEL ════════ */}
        <div
          className="relative hidden lg:flex flex-col justify-between p-10 w-[46%] flex-shrink-0 overflow-hidden text-white"
          style={{
            background: "linear-gradient(145deg, #0891b2 0%, #0e7490 45%, #164e63 100%)",
          }}
        >
          {/* Decorative rings */}
          <div className="absolute top-10 right-8 w-32 h-32 border-4 border-white/10 rounded-full spin-ring" />
          <div className="absolute top-16 right-14 w-20 h-20 border-2 border-white/5 rounded-full" />
          {/* Bottom glow */}
          <div className="absolute bottom-20 left-4 w-44 h-44 rounded-full blur-3xl"
            style={{ background: "rgba(6,182,212,0.2)" }} />

          {/* ── Brand ── */}
          <div className="relative z-10 fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🐛</span>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Bug Bunters
                </h2>
                <p className="text-cyan-200 text-xs font-medium">by CEOITBOX</p>
              </div>
            </div>

            <h3 className="text-[1.6rem] font-bold leading-snug text-white mb-1"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isRegister ? "Join the community" : "Squash bugs faster."}
            </h3>
            <h3 className="text-[1.6rem] font-bold leading-snug text-cyan-200 mb-3"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {isRegister ? "of bug hunters 🚀" : "Ship better software."}
            </h3>
          </div>

          {/* ── Illustration image ── */}
          <div className="relative z-10 flex justify-center items-center my-2">
            <img
              src="/bug-hunter-illustration.png"
              alt="Bug Hunter at Work"
              className="w-full max-w-[260px] drop-shadow-xl"
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}
            />
          </div>

          {/* ── Feature list ── */}
          <div className="relative z-10 space-y-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="feature-badge flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/15"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>{f.title}</p>
                  <p className="text-xs text-cyan-200 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Stats row ── */}
          <div className="relative z-10 flex gap-4 pt-4 border-t border-white/15">
            {STATS.map((s) => (
              <div key={s.label} className="text-center flex-1">
                <p className="text-xl font-extrabold" style={{ fontFamily: "'Poppins', sans-serif" }}>{s.value}</p>
                <p className="text-xs text-cyan-200 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ RIGHT PANEL ════════ */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 py-10 bg-white">
          <div className="w-full max-w-md">
            {authMode === "login" && (
              <Login
                onSwitchToRegister={() => setAuthMode("register")}
                onSwitchToReset={() => setAuthMode("reset")}
              />
            )}
            {authMode === "register" && (
              <Register onSwitchToLogin={() => setAuthMode("login")} />
            )}
            {authMode === "reset" && (
              <PasswordReset onSwitchToLogin={() => setAuthMode("login")} />
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="absolute bottom-3 text-center text-xs z-10"
        style={{ color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
        © {new Date().getFullYear()} CEOITBOX · Bug Bunters Platform
      </p>
    </div>
  );
}

export default AuthContainer;
