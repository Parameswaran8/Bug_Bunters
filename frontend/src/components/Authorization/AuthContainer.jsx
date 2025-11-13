"use client";

/* Added proper default export */
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import PasswordReset from "./PasswordReset";
import "./AuthContainer.css";

function AuthContainer() {
  const [authMode, setAuthMode] = useState("login"); // 'login', 'register', 'reset'

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-cyan-50 to-blue-50 overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-white rounded-full opacity-10"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white rounded-full opacity-10"></div>

      {/* Main container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 ">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-96">
            {/* Left side - Travel image and info */}
            <div
              className={`hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden form-transition ${
                authMode === "register" ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <h2 className="text-4xl font-script font-bold">CEOITBOX</h2>
                  <h4>(Bug Bunter)</h4>
                </div>
                <p className="text-sm leading-relaxed opacity-90">
                  Are you facing any issue in any tool provided by CEOITBOX?
                  Don't worry! Our Bug Bunter tool is here to help you report
                  and track bugs efficiently. Join our community of users
                  dedicated to improving the quality of our tools. Together, we
                  can make CEOITBOX better for everyone!
                </p>
              </div>

              {/* Travel background image */}
              <div className="absolute inset-0 opacity-30">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop"
                  alt="Mountain traveler"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative buildings at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-50">
                <svg
                  viewBox="0 0 300 100"
                  preserveAspectRatio="none"
                  className="w-full h-full fill-white"
                >
                  <path
                    d="M 10 80 L 10 40 L 30 40 L 30 20 L 50 20 L 50 40 L 70 40 L 70 80 M 80 80 L 80 30 L 110 30 L 110 80 M 120 80 L 120 50 L 140 50 L 140 20 L 160 20 L 160 50 L 180 50 L 180 80"
                    strokeWidth="2"
                    stroke="white"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Right side - Form content */}
            <div
              className={`flex flex-col justify-center items-center p-8 lg:p-12  ${
                authMode === "register"
                  ? "lg:-translate-x-full -translate-x-0"
                  : "translate-x-0"
              }`}
            >
              <div className="w-full max-w-md form-transition">
                {authMode === "login" && (
                  <Login
                    onSwitchToRegister={() => setAuthMode("register")}
                    onSwitchToReset={() => setAuthMode("reset")}
                  />
                )}
                {authMode === "register" && (
                  <Register onSwitchToLogin={() => setAuthMode("login")} />
                )}
                {authMode === "reset" && (
                  <PasswordReset onSwitchToLogin={() => setAuthMode("login")} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
