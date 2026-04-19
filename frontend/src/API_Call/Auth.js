// Example send helper - adjust fields to match your form state
// async function sendBugReport(payload) {
//   try {
//     const res = await fetch("/api/bug-report", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//       keepalive: true, // helps POST during unload in modern browsers
//     });
//     return res.ok;
//   } catch (err) {
//     console.error("Failed to send bug report:", err);
//     return false;
//   }
// }

import api from "./API";

// --------------------------
// REGISTER — user creation
// --------------------------

export const register = async (userData) => {
  try {
    const res = await api.post("/authextend/register", userData);
    console.log(26, res)
    return {
      success: true,
      message: res.data.message,
      user: res.data.user,
    };
  } catch (error) {
    console.log(32, error)
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong during registration",
    };
  }
};

// --------------------------
// CHECK IF USER LOGGED IN
// --------------------------
export const checkAuth = async () => {
  try {
    const res = await api.get("/authextend/me", {
      withCredentials: true,
    });

    console.log("Auth check response:", res);
    return res.data.user; // authenticated user
  } catch (error) {
    return null; // not authenticated
  }
};

// --------------------------
// LOGIN — cookie automatically stored
// --------------------------

export const login = async (credentials) => {
  try {
    const res = await api.post("/auth/login", credentials, {
      withCredentials: true,
    });

    return {
      success: true,
      message: res.data.message,
      user: res.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};

// --------------------------
// OTP LOGIN
// --------------------------

export const requestOtpLogin = async (email) => {
  try {
    const res = await api.post("/auth/request-login-otp", { email });
    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send OTP",
    };
  }
};

export const verifyOtpLogin = async (data) => {
  try {
    const res = await api.post("/auth/verify-login-otp", data, {
      withCredentials: true,
    });
    return {
      success: true,
      message: res.data.message,
      user: res.data.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Invalid or expired OTP",
    };
  }
};

// --------------------------
// PASSWORD RESET (OTP)
// --------------------------

export const requestOtpReset = async (username_email) => {
  try {
    const res = await api.post("/reset/request", { username_email });
    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to request OTP",
    };
  }
};

export const verifyOtpReset = async (data) => {
  try {
    const res = await api.post("/reset/verify", data);
    return { success: true, message: res.data.message, resetToken: res.data.resetToken };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Invalid or expired OTP",
    };
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await api.post("/reset/password", data);
    return { success: true, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset password",
    };
  }
};

// --------------------------
// LOGOUT — backend clears cookie
// --------------------------

export const logout = async () => {
  try {
    const res = await api.post(`/auth/logout`, {
      credentials: true,
    });

    console.log(78, res);
    return {
      success: true,
      message: res.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
};
