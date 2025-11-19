"use client";

/* Added proper default export */
import { useState } from "react";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";

function PasswordReset({ onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("OTP sent to your email");
      setStep(2);
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
    setTimeout(() => {
      toast.success("OTP verified");
      setStep(3);
      setLoading(false);
    }, 1000);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("Password updated successfully");
      setLoading(false);
      // Reset and go back to login
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep(1);
      onSwitchToLogin();
    }, 1000);
  };

  return (
    <div className="w-full fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Reset Password</h1>
        <p className="text-gray-600">Step {step} of 3</p>
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "SEND OTP"}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                className="w-full outline-none text-gray-700 bg-transparent tracking-widest text-center text-2xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "VERIFY OTP"}
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="flex items-center border-2 border-primary rounded-lg px-4 py-3">
              <MdLock className="text-primary text-xl mr-3" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "UPDATE PASSWORD"}
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="text-center mt-6">
        <button
          onClick={onSwitchToLogin}
          className="text-primary font-medium hover:text-primary-dark transition"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default PasswordReset;
