"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import SocialButtons from "./SocialButtons";

/* ─── Reusable input field wrapper ─── */
function InputField({ icon: Icon, label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-600 tracking-wide block">
        {label}
      </label>
      <div className="input-group flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 transition-all duration-200">
        <Icon className="text-cyan-500 text-xl flex-shrink-0" />
        {children}
      </div>
      {hint && <p className="text-xs text-gray-400 pl-1">{hint}</p>}
    </div>
  );
}

/* ─── Password strength ─── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const strength = (() => {
    if (password.length < 6) return { label: "Weak", color: "bg-red-400", w: "w-1/4", text: "text-red-500" };
    if (password.length < 10) return { label: "Fair", color: "bg-yellow-400", w: "w-2/4", text: "text-yellow-500" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return { label: "Good", color: "bg-blue-400", w: "w-3/4", text: "text-blue-500" };
    return { label: "Strong", color: "bg-green-400", w: "w-full", text: "text-green-500" };
  })();
  return (
    <div className="space-y-1 px-1">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.w}`} />
      </div>
      <p className="text-xs text-gray-400">
        Strength:{" "}
        <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
      </p>
    </div>
  );
}

/* ─── Password match indicator ─── */
function MatchIndicator({ password, confirm }) {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <div className={`flex items-center gap-1.5 text-xs px-1 ${match ? "text-green-500" : "text-red-400"}`}>
      <CheckCircle2 size={14} className={`${match ? "opacity-100" : "opacity-40"}`} />
      {match ? "Passwords match" : "Passwords do not match"}
    </div>
  );
}

/* ─── Main Register Component ─── */
function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!agreed) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("Account created! Welcome aboard 🎉");
      setLoading(false);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreed(false);
    }, 1200);
  };

  return (
    <div className="w-full fade-in">

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Create account ✨
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm">
          Join Bug Bunters and start squashing bugs today
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleRegister} className="space-y-4">

        {/* Username */}
        <InputField icon={User} label="Username">
          <input
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            autoComplete="username"
          />
        </InputField>

        {/* Email */}
        <InputField icon={Mail} label="Email Address">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            autoComplete="email"
          />
        </InputField>

        {/* Password */}
        <div className="space-y-2">
          <InputField
            icon={Lock}
            label="Password"
            hint="Min. 8 chars, one uppercase & number recommended"
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-cyan-500 transition flex-shrink-0"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputField>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <InputField icon={Lock} label="Confirm Password">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-cyan-500 transition flex-shrink-0"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </InputField>
          <MatchIndicator password={password} confirm={confirmPassword} />
        </div>

        {/* Terms & Conditions */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none group pt-1">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all duration-200 ${
              agreed ? "bg-cyan-500 border-cyan-500" : "border-gray-300 group-hover:border-cyan-400"
            }`}
          >
            {agreed && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-600 leading-relaxed">
            I agree to the{" "}
            <button type="button" className="text-cyan-600 font-semibold hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-cyan-600 font-semibold hover:underline">
              Privacy Policy
            </button>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-shine w-full text-white font-bold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating account…
            </>
          ) : (
            "Create Account →"
          )}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Social ── */}
      <SocialButtons />

      {/* ── Login Link ── */}
      <p className="text-center mt-6 text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-cyan-600 font-bold hover:text-cyan-800 transition underline underline-offset-2"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export default Register;
