import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/API_Call/User";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Pencil,
  X,
  Check,
  Loader2,
} from "lucide-react";

function getRoleLabel(user) {
  if (!user) return "—";
  const roleArr = Array.isArray(user.roletype) ? user.roletype : [user.roletype || "bugreporter"];
  const labelMap = {
    bugreporter: "Bug Reporter",
    tester: "Tester",
    dev: "Developer",
    admin: "Admin",
    superadmin: "Super Admin",
  };
  return roleArr.map((r) => labelMap[r] || r).join(", ");
}

function General() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", phone: "" });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        phone: user.phone || user.mobile || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateUser(user.id || user._id, form);
      if (res.success) {
        setUser({ ...user, ...form });
        toast.success("Profile updated");
        setIsEditing(false);
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-500 mt-1">Update your account details and how others see you.</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
            <Pencil size={16} /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 p-6 border border-gray-100 rounded-2xl bg-gray-50/30">
          <div className="space-y-2">
            <Label className="text-gray-500">Full Name</Label>
            {isEditing ? (
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-white" />
            ) : (
              <p className="text-base font-medium text-gray-900 px-3 py-2 bg-white border border-gray-100 rounded-lg">{user?.name || "—"}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-500">Username</Label>
              {isEditing ? (
                <Input value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="bg-white" />
              ) : (
                <p className="text-base font-medium text-gray-900 px-3 py-2 bg-white border border-gray-100 rounded-lg">@{user?.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500">Phone</Label>
              {isEditing ? (
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-white" />
              ) : (
                <p className="text-base font-medium text-gray-900 px-3 py-2 bg-white border border-gray-100 rounded-lg">{user?.phone || user?.mobile || "—"}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500">Email Address</Label>
            <p className="text-base font-medium text-gray-400 px-3 py-2 bg-gray-100/50 border border-dashed border-gray-200 rounded-lg cursor-not-allowed">
              {user?.email}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Role</p>
                <p className="text-sm font-semibold text-gray-700">{getRoleLabel(user)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default General;
