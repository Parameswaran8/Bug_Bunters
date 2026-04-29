import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Hand,
  PartyPopper
} from "lucide-react";
import toast from "react-hot-toast";
import { login } from "@/API_Call/Auth";

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
  const [username_email, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!username_email || !password)
      return toast.error("Please fill in all fields");
    setLoading(true);
    const userData = { username_email, password, keepMeSignedIn: rememberMe };
    const login_check = await login(userData);
    if (login_check.success) {
      setUser(login_check.user);
      toast.success(
        <div className="flex items-center gap-2">
          Welcome back! <PartyPopper className="w-5 h-5 text-yellow-500" />
        </div>
      );
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
          className="text-3xl font-extrabold text-gray-900 leading-tight flex items-center gap-3"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Welcome back <Hand className="text-yellow-400 w-8 h-8" />
        </h1>
        <p className="text-gray-500 mt-1.5 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
          Sign in to continue tracking &amp; reporting bugs
        </p>
      </div>

      {/* ══════════ LOGIN FORM ══════════ */}
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


      {/* ── Register Link ── */}
      <p className="text-center mt-7 text-sm text-gray-500">
        New to Bug Hunter?{" "}
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
