import api from "./API";

export const getNotifications = async () => {
  try {
    const res = await api.get("/notifications", { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`, {}, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await api.patch("/notifications/read-all", {}, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return null;
  }
};
