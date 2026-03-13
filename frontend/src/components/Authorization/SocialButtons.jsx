"use client";

import { FaGoogle, FaGithub, FaMicrosoft } from "react-icons/fa";
import toast from "react-hot-toast";

const PROVIDERS = [
  {
    id: "Google",
    icon: FaGoogle,
    label: "Google",
    color: "hover:bg-red-50 hover:border-red-300",
    iconColor: "text-red-500",
  },
  {
    id: "GitHub",
    icon: FaGithub,
    label: "GitHub",
    color: "hover:bg-gray-50 hover:border-gray-400",
    iconColor: "text-gray-800",
  },
  {
    id: "Microsoft",
    icon: FaMicrosoft,
    label: "Microsoft",
    color: "hover:bg-blue-50 hover:border-blue-400",
    iconColor: "text-blue-600",
  },
];

function SocialButtons() {
  const handleSocialLogin = (provider) => {
    const id = toast.loading(`Redirecting to ${provider}…`);
    setTimeout(() => {
      toast.dismiss(id);
      toast(`${provider} SSO would be triggered here`, { icon: "🔗" });
    }, 800);
  };

  return (
    <div className="flex gap-3">
      {PROVIDERS.map(({ id, icon: Icon, label, color, iconColor }) => (
        <button
          key={id}
          onClick={() => handleSocialLogin(id)}
          title={`Sign in with ${label}`}
          className={`social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 ${color} transition-all duration-200`}
        >
          <Icon className={`text-lg ${iconColor}`} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default SocialButtons;
