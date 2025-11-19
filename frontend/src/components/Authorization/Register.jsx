"use client";

/* Added proper default export */
import { useState } from "react";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";
import SocialButtons from "./SocialButtons";

function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
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

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Account created successfully");
      setLoading(false);
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  return (
    <div className="w-full fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Create Account</h1>
        <p className="text-gray-600">Join us today</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
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

        {/* Confirm Password Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
            <MdLock className="text-primary text-xl mr-3" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full outline-none text-gray-700 bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-primary hover:text-primary-dark transition"
            >
              {showConfirmPassword ? (
                <MdVisibilityOff className="text-xl" />
              ) : (
                <MdVisibility className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-6"
        >
          {loading ? "Creating Account..." : "REGISTER"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-gray-600 text-sm font-medium">OR</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Social Buttons */}
      <SocialButtons />

      {/* Login Link */}
      <p className="text-center mt-6 text-gray-700">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-primary font-bold hover:text-primary-dark transition"
        >
          Login In
        </button>
      </p>
    </div>
  );
}

export default Register;
