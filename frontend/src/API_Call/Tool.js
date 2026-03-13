import api from "./API";

/**
 * Fetch all tools natively from the backend.
 * @returns {Promise<{success: boolean, data: any} | {success: boolean, message: string}>}
 */
export const getTools = async () => {
  try {
    const res = await api.get("/tools/getTools");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error fetching tools:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch tools",
    };
  }
};

/**
 * Creates or Updates a tool payload leveraging the native batch operation processor logic.
 * @param {Object} toolData 
 * @returns {Promise<{success: boolean, data: any} | {success: boolean, message: string}>}
 */
export const updateTool = async (toolData) => {
  try {
    const res = await api.post("/tools/update_tool", { tools: [toolData] });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error updating tool:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update tool",
    };
  }
};
