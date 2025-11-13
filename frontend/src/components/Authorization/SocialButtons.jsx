"use client";

/* Added proper default export */
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import toast from "react-hot-toast";

function SocialButtons() {
  const handleSocialLogin = (provider) => {
    toast.loading(`Redirecting to ${provider}...`);
    setTimeout(() => {
      toast.success(`${provider} login flow would be triggered here`);
    }, 500);
  };

  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={() => handleSocialLogin("Google")}
        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
        title="Google"
      >
        <FaGoogle className="text-gray-700 text-lg" />
      </button>
      <button
        onClick={() => handleSocialLogin("Facebook")}
        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
        title="Facebook"
      >
        <FaFacebook className="text-gray-700 text-lg" />
      </button>
      <button
        onClick={() => handleSocialLogin("Apple")}
        className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
        title="Apple"
      >
        <FaApple className="text-gray-700 text-lg" />
      </button>
    </div>
  );
}

export default SocialButtons;
