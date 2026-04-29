import api from "./API";

// --------------------------
// BUG CRUD OPERATIONS
// --------------------------

export const createBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_create", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to create bug" };
  }
};

export const updateBug = async (bugData) => {
  try {
    const res = await api.post("/bug/update_Bug", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to update bug" };
  }
};

export const deleteBug = async (bugData) => {
  try {
    const res = await api.post("/bug/delete_Bug", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to delete bug" };
  }
};

export const getBugs = async (filters = {}) => {
  try {
    const res = await api.post("/bug/get_bugs", filters);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to get bugs" };
  }
};

export const getBugById = async (bugData) => {
  try {
    const res = await api.post("/bug/get_BugById", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to get bug by ID" };
  }
};

export const getBugStatistics = async (reqData = {}) => {
  try {
    const res = await api.post("/bug/get_BugStatistics", reqData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to get bug statistics" };
  }
};

export const getBugLogs = async (bugData) => {
  try {
    const res = await api.post("/bug/get_BugLogs", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to get activity logs" };
  }
};

// --------------------------
// BUG LIFECYCLE OPERATIONS
// --------------------------

export const confirmBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_confirm", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to confirm bug" };
  }
};

export const analyzeBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_Analyze", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to analyze bug" };
  }
};

export const fixBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_Fix", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fix bug" };
  }
};

export const finalTestBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_FinalTest", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to final test bug" };
  }
};

export const deployBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_Deploy", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to deploy bug" };
  }
};

export const closeBug = async (bugData) => {
  try {
    const res = await api.post("/bug/bug_Close", bugData);
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to close bug" };
  }
};

export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await api.post("/bug/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Upload failed" };
  }
};
