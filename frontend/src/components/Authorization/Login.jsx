/* Added proper default export */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";
import SocialButtons from "./SocialButtons";

function Login({ onSwitchToRegister, onSwitchToReset }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("password"); // 'password' or 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("OTP verified successfully");
      setLoading(false);
      // Reset form
      setEmail("");
      setOtp("");
      setOtpSent(false);
    }, 1000);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const userData = { email, name: email.split("@")[0] };
      login(userData); // Save user to context
      toast.success("Logged in successfully");
      setLoading(false);
      navigate("/"); // Redirect to dashboard
    }, 1000);
  };

  return (
    <div className="w-full fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome</h1>
        <p className="text-gray-600">Login with Email</p>
      </div>

      {mode === "password" ? (
        // Password Login Form
        <>
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Id
              </label>
              <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
                <MdEmail className="text-primary text-xl mr-3" />
                <input
                  type="email"
                  placeholder="yourmail@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-gray-700 bg-transparent"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
                <MdLock className="text-primary text-xl mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none text-gray-700 bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-primary hover:text-primary-dark transition"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="text-xl" />
                  ) : (
                    <MdVisibility className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-sm text-primary hover:text-primary-dark font-medium transition"
              >
                Forgot your password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          {/* Toggle OTP Mode */}
          <div className="text-center my-4">
            <p className="text-gray-600 text-sm">
              Or{" "}
              <button
                type="button"
                onClick={() => setMode("otp")}
                className="text-primary font-medium hover:text-primary-dark transition"
              >
                Login with OTP
              </button>
            </p>
          </div>
        </>
      ) : (
        // OTP Login Form
        <>
          <form
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            className="space-y-4"
          >
            {/* Email Field */}
            {!otpSent && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Id
                </label>
                <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
                  <MdEmail className="text-primary text-xl mr-3" />
                  <input
                    type="email"
                    placeholder="thisuser@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full outline-none text-gray-700 bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* OTP Field */}
            {otpSent && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength="6"
                    className="w-full outline-none text-gray-700 bg-transparent tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Send/Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Processing..." : otpSent ? "VERIFY OTP" : "SEND OTP"}
            </button>
          </form>

          {/* Toggle Password Mode */}
          <div className="text-center my-4">
            <p className="text-gray-600 text-sm">
              Or{" "}
              <button
                type="button"
                onClick={() => setMode("password")}
                className="text-primary font-medium hover:text-primary-dark transition"
              >
                Login with Password
              </button>
            </p>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-gray-600 text-sm font-medium">OR</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Social Buttons */}
      <SocialButtons />

      {/* Register Link */}
      <p className="text-center mt-6 text-gray-700">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-primary font-bold hover:text-primary-dark transition"
        >
          Register Now
        </button>
      </p>
    </div>
  );
}

export default Login;
