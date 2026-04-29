import api from "./API";

export const getAllUsers = async () => {
  try {
    const res = await api.get("/user/get_all_users");
    return { success: true, data: res.data.data };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

// authextend

export const updateUser = async (id, userData) => {
  try {
    const res = await api.put(`/user/update_user/${id}`, userData);
    return { success: true, data: res.data.data, message: res.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update user",
    };
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/user/delete_user/${id}`);
    return { success: true, message: res.data.message };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete user",
    };
  }
};

export const changePassword = async (id, { oldPassword, newPassword }) => {
  try {
    const res = await api.post(`/user/change_password/${id}`, { oldPassword, newPassword });
    return { success: true, message: res.data.message };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password",
    };
  }
};
