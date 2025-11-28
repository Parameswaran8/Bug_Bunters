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
