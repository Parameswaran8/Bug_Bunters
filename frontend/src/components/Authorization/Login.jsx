import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdSms,
} from "react-icons/md";
import toast from "react-hot-toast";
import SocialButtons from "./SocialButtons";
import { login } from "@/API_Call/Auth";

/* ─────────────── OTP digit input row ─────────────── */
function OtpInput({ value, onChange }) {
  const digits = 6;
  const refs = Array.from({ length: digits }, () => useRef(null));
  const arr = value.padEnd(digits, "").split("").slice(0, digits);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = arr.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next);
      if (i > 0 && !arr[i]) refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = arr.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < digits - 1) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, digits - 1);
    refs[focusIdx].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {arr.map((digit, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`otp-box ${digit ? "filled" : ""}`}
        />
      ))}
    </div>
  );
}

/* ─────────────── InputField ─────────────── */
function InputField({ icon: Icon, label, children, extra }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-600 tracking-wide">
          {label}
        </label>
        {extra}
      </div>
      <div className="input-group flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 transition-all duration-200">
        <Icon className="text-cyan-500 text-xl flex-shrink-0" />
        {children}
      </div>
    </div>
  );
}

/* ─────────────── Main Login Component ─────────────── */
function Login({ onSwitchToRegister, onSwitchToReset }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("password"); // 'password' | 'otp'
  const [username_email, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { user, setUser, loading, setLoading } = useAuth();

  /* ── redirect if already logged in ── */
  useEffect(() => {
    if (user && !username_email) {
      toast.success("Already logged in!");
      navigate("/");
    }
  }, [user]);

  /* ── handlers ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!username_email) return toast.error("Please enter your email");
    setLoading(true);
    setTimeout(() => {
      toast.success("OTP sent to your email 📬");
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    setTimeout(() => {
      toast.success("OTP verified successfully ✅");
      setLoading(false);
      setUsernameEmail("");
      setOtp("");
      setOtpSent(false);
    }, 1000);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!username_email || !password)
      return toast.error("Please fill in all fields");
    setLoading(true);
    const userData = { username_email, password };
    const login_check = await login(userData);
    if (login_check.success) {
      setUser(login_check.user);
      toast.success("Welcome back! 🎉");
      navigate("/");
    } else {
      toast.error(login_check.message);
    }
    setLoading(false);
  };



  return (
    <div className="w-full fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1
          className="text-3xl font-extrabold text-gray-900 leading-tight"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Welcome back 👋
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
          Sign in to continue tracking &amp; reporting bugs
        </p>
      </div>

      {/* ── Mode Toggle Tabs (underline style) ── */}
      <div className="flex border-b border-gray-200 mb-7">
        <button
          type="button"
          onClick={() => { setMode("password"); setOtpSent(false); setOtp(""); }}
          className={`flex items-center gap-2 px-1 pb-3 mr-6 text-sm font-semibold border-b-2 transition-all duration-200 ${
            mode === "password"
              ? "border-cyan-500 text-cyan-600"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          <MdLock className="text-base" />
          Password
        </button>
        <button
          type="button"
          onClick={() => { setMode("otp"); setOtpSent(false); setOtp(""); }}
          className={`flex items-center gap-2 px-1 pb-3 text-sm font-semibold border-b-2 transition-all duration-200 ${
            mode === "otp"
              ? "border-cyan-500 text-cyan-600"
              : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
          }`}
        >
          <MdSms className="text-base" />
          OTP Login
        </button>
      </div>

      {/* ══════════ PASSWORD MODE ══════════ */}
      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          {/* Email / Username */}
          <InputField icon={MdEmail} label="Email or Username">
            <input
              type="text"
              placeholder="you@company.com"
              value={username_email}
              onChange={(e) => setUsernameEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              autoComplete="username"
            />
          </InputField>

          {/* Password */}
          <InputField
            icon={MdLock}
            label="Password"
            extra={
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-xs text-cyan-500 hover:text-cyan-700 font-semibold transition"
              >
                Forgot password?
              </button>
            }
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-cyan-500 transition flex-shrink-0"
            >
              {showPassword ? (
                <MdVisibilityOff className="text-lg" />
              ) : (
                <MdVisibility className="text-lg" />
              )}
            </button>
          </InputField>



          {/* Remember me */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                rememberMe
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-gray-300 group-hover:border-cyan-400"
              }`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-600">Keep me signed in</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-shine w-full text-white font-semibold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      ) : (
        /* ══════════ OTP MODE ══════════ */
        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="space-y-5"
        >
          {!otpSent ? (
            <>
              <InputField icon={MdEmail} label="Email Address">
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={username_email}
                  onChange={(e) => setUsernameEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
                  autoComplete="email"
                />
              </InputField>
              <p className="text-xs text-gray-400 leading-relaxed">
                We'll send a 6-digit one-time code to your email. Valid for 10 minutes.
              </p>
            </>
          ) : (
            <>
              {/* Success banner */}
              <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
                <span className="text-lg">📬</span>
                <div>
                  <p className="text-sm font-semibold text-cyan-700">OTP Sent!</p>
                  <p className="text-xs text-cyan-500">Check your inbox at{" "}<span className="font-medium">{username_email}</span></p>
                </div>
              </div>

              {/* OTP digit boxes */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-600 tracking-wide block">
                  Enter 6-Digit Code
                </label>
                <OtpInput value={otp} onChange={setOtp} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="text-xs text-cyan-500 hover:underline w-full text-center"
              >
                Use a different email?
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={loading || (otpSent && otp.length < 6)}
            className="btn-primary-shine w-full text-white font-semibold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {otpSent ? "Verifying…" : "Sending…"}
              </>
            ) : otpSent ? (
              "Verify & Sign In"
            ) : (
              "Send OTP Code"
            )}
          </button>
        </form>
      )}

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* ── Social Buttons ── */}
      <SocialButtons />

      {/* ── Register Link ── */}
      <p className="text-center mt-7 text-sm text-gray-500">
        New to Bug Bunters?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-cyan-600 font-bold hover:text-cyan-800 transition underline underline-offset-2"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

export default Login;
