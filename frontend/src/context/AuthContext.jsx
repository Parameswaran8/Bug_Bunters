import { checkAuth } from "@/API_Call/Auth";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  let apiLink = "http://localhost:8000/api";
  if (document.location.href.includes("localhost")) {
    apiLink = "http://localhost:8000/api";
  } else if (document.location.href.includes("103.209.144.223")) {
    apiLink = "//103.209.144.223:6969/api";
  } else {
    apiLink = "https://bug.ceoitbox.com/api";
  }

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [headers, setHeaders] = useState({
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const userData = await checkAuth();
        setUser(userData);
        console.log("Auth check response 27:", userData);
      } catch (err) {
        console.log("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuth();
  }, []);

  const value = {
    apiLink,
    headers,
    setHeaders,
    user,
    setUser,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
