import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/API_Call/User";
import toast from "react-hot-toast";
import {
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function StrengthBar({ password }) {
  const checks = [
    { label: "At least 6 characters",    pass: password.length >= 6 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains number",           pass: /[0-9]/.test(password) },
    { label: "Contains special character",pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${score < 2 ? "text-red-500" : score < 4 ? "text-yellow-600" : "text-emerald-600"}`}>
        {labels[score - 1] || "Too weak"}
      </p>
      {/* Checklist */}
      <ul className="space-y-1 pt-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            {c.pass
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              : <XCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            }
            <span className={`text-xs ${c.pass ? "text-emerald-600" : "text-gray-400"}`}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PasswordInput({ id, label, value, onChange, placeholder, icon: Icon }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-gray-400 uppercase font-semibold tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="bg-gray-50 border-gray-200 pr-10 focus:border-cyan-400 focus:ring-cyan-100 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordControl() {
  const { user } = useAuth();
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const newPasswordStrong = form.new.length >= 6;
  const passwordsMatch   = form.new === form.confirm;
  const canSubmit        = form.old && form.new && form.confirm && newPasswordStrong && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      toast.error("New passwords do not match");
      return;
    }
    if (!newPasswordStrong) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) { toast.error("User session not found"); return; }

    setSaving(true);
    try {
      const res = await changePassword(userId, {
        oldPassword: form.old,
        newPassword: form.new,
      });

      if (res.success) {
        toast.success("Password changed successfully");
        setForm({ old: "", new: "", confirm: "" });
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              You must enter your current password before setting a new one.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Current (old) password */}
          <div className="pb-5 border-b border-gray-100">
            <PasswordInput
              id="old-password"
              label="Current Password"
              value={form.old}
              onChange={set("old")}
              placeholder="Enter your current password"
              icon={Lock}
            />
          </div>

          {/* New password */}
          <PasswordInput
            id="new-password"
            label="New Password"
            value={form.new}
            onChange={set("new")}
            placeholder="Enter a new password"
            icon={ShieldCheck}
          />
          <StrengthBar password={form.new} />

          {/* Confirm new password */}
          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            value={form.confirm}
            onChange={set("confirm")}
            placeholder="Re-enter your new password"
            icon={ShieldCheck}
          />

          {/* Mismatch warning */}
          {form.confirm && !passwordsMatch && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Passwords do not match
            </p>
          )}
          {form.confirm && passwordsMatch && form.confirm.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              Passwords match
            </p>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={!canSubmit || saving}
              className="h-10 px-6 gap-2 bg-cyan-600 hover:bg-cyan-700 text-white transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {saving ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PasswordControl;
