import { createContext, useContext, useState, useEffect } from "react";
import socketService from "../services/socket.service";

export const Context = createContext<any>(null);

export const useData = (): Record<any, any> => {
  const data = useContext(Context);
  return data;
};

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  let apiLink = "http://localhost:8000/api";
  if (document.location.href.includes("localhost")) {
    apiLink = "http://localhost:8000/api";
  } else if (document.location.href.includes("103.209.144.223")) {
    apiLink = "//103.209.144.223:6969/api";
  } else {
    apiLink = "https://ln.ceoitbox.com/api";
  }

  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [introTemplates, setIntroTemplates] = useState([]);
  const [greetingTemplates, setGreetingTemplates] = useState([]);
  const [token, setToken] = useState(() => {
    // Try to get token from cookies on initial load
    return Cookies.get("token") || null;
  });
  const [headers, setHeaders] = useState({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Update headers when token changes
  useEffect(() => {
    setHeaders({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    });
  }, [token]);

  // Persist token to cookies
  useEffect(() => {
    if (token) {
      Cookies.set("token", token, { expires: 7 }); // Expires in 1 day
    } else {
      Cookies.remove("token");
    }
  }, [token]);

  // Socket.io connection management
  useEffect(() => {
    if (token && user) {
      // Connect to Socket.io when user is authenticated
      socketService.connect(token);

      // Set up event listeners
      const handleConnect = () => {
        setSocketConnected(true);
        socketService.requestOnlineUsers();
      };

      const handleDisconnect = () => {
        setSocketConnected(false);
      };

      const handleOnlineUsersUpdate = (data: any) => {
        setOnlineUsers(data.onlineUsers);
        setOnlineUserIds(data.onlineUserIds);
      };

      const handleOnlineUsersList = (data: any) => {
        setOnlineUsers(data);
        setOnlineUserIds(data.map((user: any) => user.userId));
      };

      socketService.addEventListener("connect", handleConnect);
      socketService.addEventListener("disconnect", handleDisconnect);
      socketService.addEventListener(
        "online_users_updated",
        handleOnlineUsersUpdate
      );
      socketService.addEventListener(
        "online_users_list",
        handleOnlineUsersList
      );

      // Cleanup function
      return () => {
        socketService.removeEventListener("connect", handleConnect);
        socketService.removeEventListener("disconnect", handleDisconnect);
        socketService.removeEventListener(
          "online_users_updated",
          handleOnlineUsersUpdate
        );
        socketService.removeEventListener(
          "online_users_list",
          handleOnlineUsersList
        );
      };
    } else {
      // Disconnect when user logs out
      socketService.disconnect();
      setSocketConnected(false);
      setOnlineUsers([]);
      setOnlineUserIds([]);
    }
  }, [token, user]);

  const value = {
    apiLink,
    headers,
    setHeaders,
    user,
    setUser,
    token,
    setToken,
    groups,
    setGroups,
    settings,
    setSettings,
    templates,
    setTemplates,
    onlineUsers,
    setOnlineUsers,
    onlineUserIds,
    setOnlineUserIds,
    socketConnected,
    setSocketConnected,
    socketService,
    introTemplates,
    setIntroTemplates,
    greetingTemplates,
    setGreetingTemplates,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
