import { checkAuth } from "@/API_Call/Auth";
import { systemConfig } from "@/API_Call/Config";
import { getTools } from "@/API_Call/Tool";
import { getAllUsers } from "@/API_Call/User";
import { getBugs } from "@/API_Call/Bug";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

console.log("AuthContext MODULE EVALUATED. Context instance:", AuthContext);

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
    const fetchGlobalData = async () => {
      try {
        const [userData, configData, toolsData, usersData, bugsData] = await Promise.all([
          checkAuth(),
          systemConfig(),
          getTools(),
          getAllUsers(),
          getBugs()
        ]);
        
        setUser(userData);
        if (configData.success && configData.data) {
          setPlatformList(configData.data.platformList || []);
        }

        if (toolsData.success && toolsData.data) {
          const mappedTools = toolsData.data.map(t => ({ ...t, id: t._id }));
          setToolList(mappedTools);
        }

        if (usersData.success && usersData.data) {
          const mappedUsers = usersData.data.map(u => ({ ...u, id: u._id }));
          setAllUsers(mappedUsers);
        }

        if (bugsData.success && bugsData.data) {
          // Adjust based on the actual API wrapper if necessary.
          // The Bug.js API layer directly maps the response properly for us here.
          setBugsList(bugsData.data.results || bugsData.data || []);
        }
      } catch (err) {
        console.log("Global data load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);


  const [platformList, setPlatformList] = useState([]);
  const [allStages, setAllStages] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const [priority,setPriority] = useState([]);

  const [toolList, setToolList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [bugsList, setBugsList] = useState([]);

  const value = {
    apiLink,
    headers,
    setHeaders,
    user,
    setUser,
    loading,
    setLoading,
    
    platformList,
    allStages,
    allStatus,
    priority,
    toolList,
    setToolList,
    allUsers,
    setAllUsers,
    bugsList,
    setBugsList
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
