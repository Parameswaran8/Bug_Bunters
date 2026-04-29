"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, MailQuestion, PartyPopper } from "lucide-react";
import toast from "react-hot-toast";
import { requestOtpReset, verifyOtpReset, resetPassword } from "@/API_Call/Auth";

/* ─────────────── Shared OTP Input ─────────────── */
function OtpInput({ value, onChange }) {
  const digits = 6;
  const inputRefs = useRef([]);

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
          className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-2xl transition-all duration-200 outline-none ${
            arr[i] 
              ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]" 
              : "border-gray-200 bg-gray-50 text-gray-800"
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────── Shared Input Field ─────────────── */
function InputField({ icon: Icon, label, children, extra }) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-600 tracking-wide">
          {label}
        </label>
        {extra}
      </div>
      <div className="input-group flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3.5 transition-all duration-200 focus-within:border-cyan-500 focus-within:bg-white shadow-sm">
        <Icon className="text-cyan-500 text-xl flex-shrink-0" />
        {children}
      </div>
    </div>
  );
}

function PasswordReset({ onSwitchToLogin }) {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    const result = await requestOtpReset(email);
    if (result.success) {
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <MailQuestion className="text-cyan-600 w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-gray-900">OTP Sent!</span>
              <span className="text-xs text-gray-500">Check your inbox at <span className="font-semibold text-cyan-600">{email}</span></span>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
      setStep(2);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Please enter 6-digit OTP");
    setLoading(true);
    const result = await verifyOtpReset({ username_email: email, otp });
    if (result.success) {
      toast.success("Identity verified! Set your new password.");
      setResetToken(result.resetToken);
      setStep(3);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.error("Please fill in all fields");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    const result = await resetPassword({ resetToken, newPassword });
    if (result.success) {
      toast.success(
        <div className="flex items-center gap-2">
          Password updated successfully! <PartyPopper className="w-5 h-5 text-yellow-500" />
        </div>
      );
      onSwitchToLogin();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full fade-in">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Reset Password
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-cyan-500" : s < step ? "w-2 bg-cyan-200" : "w-2 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium ml-1">Step {step} of 3</span>
        </div>
      </div>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <InputField icon={Mail} label="Email Address">
            <input
              type="email"
              placeholder="thisuser@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            />
          </InputField>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-shine w-full text-white font-semibold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Sending OTP..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP Verification ── */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
          <div className="space-y-3 text-left">
            <label className="text-sm font-semibold text-gray-600 tracking-wide block">
              Enter Verification Code
            </label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn-primary-shine w-full text-white font-semibold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-cyan-500 hover:underline"
          >
            Use a different email?
          </button>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === 3 && (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <InputField icon={Lock} label="New Password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-cyan-500 transition flex-shrink-0"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </InputField>

          <InputField icon={Lock} label="Confirm Password">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-cyan-500 transition flex-shrink-0"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </InputField>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-shine w-full text-white font-semibold py-3.5 rounded-2xl text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}

      {/* ── Footer Link ── */}
      <div className="text-center mt-10">
        <button
          onClick={onSwitchToLogin}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-cyan-600 transition-all duration-200"
        >
          <ChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default PasswordReset;
