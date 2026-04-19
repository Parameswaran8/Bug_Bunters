import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MessageSquare 
} from "lucide-react";
import toast from "react-hot-toast";
import { login, requestOtpLogin, verifyOtpLogin } from "@/API_Call/Auth";

/* ─────────────── OTP digit input row ─────────────── */
function OtpInput({ value, onChange }) {
  const digits = 6;
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, digits);
  }, []);

  const arr = value.padEnd(digits, "").split("").slice(0, digits);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (!arr[i] && i > 0) {
        inputRefs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value;
    const char = val.slice(-1).replace(/\D/g, "");
    
    const nextArr = [...arr];
    nextArr[i] = char;
    const nextStr = nextArr.join("").slice(0, digits);
    onChange(nextStr);

    if (char && i < digits - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    onChange(pasted);
  };

  return (
    <div className="flex gap-2.5 justify-center py-2" onPaste={handlePaste}>
      {Array.from({ length: digits }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={arr[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className={`otp-box ${arr[i] ? "filled" : ""}`}
          style={{ 
            width: "42px", 
            height: "50px", 
            textAlign: "center", 
            fontSize: "1.2rem", 
            fontWeight: "bold",
            borderRadius: "8px",
            border: "2px solid #e2e8f0",
            backgroundColor: arr[i] ? "#ecfeff" : "#f8fafc"
          }}
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
    const result = await requestOtpLogin(username_email);
    if (result.success) {
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <span className="text-2xl">📬</span>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">OTP Sent!</span>
              <span className="text-xs text-gray-500">Check your inbox at <span className="font-semibold text-cyan-600">{username_email}</span></span>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
      setOtpSent(true);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    const result = await verifyOtpLogin({ email: username_email, otp, keepMeSignedIn: rememberMe });
    if (result.success) {
      setUser(result.user);
      toast.success("Welcome back! 🎉");
      navigate("/");
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!username_email || !password)
      return toast.error("Please fill in all fields");
    setLoading(true);
    const userData = { username_email, password, keepMeSignedIn: rememberMe };
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
          <Lock size={16} />
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
          <MessageSquare size={16} />
          OTP Login
        </button>
      </div>

      {/* ══════════ PASSWORD MODE ══════════ */}
      {mode === "password" ? (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          {/* Email / Username */}
          <InputField icon={Mail} label="Email or Username">
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
            icon={Lock}
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
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
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
              <InputField icon={Mail} label="Email Address">
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
