import api from "./API";

// --------------------------
// SYSTEM CONFIGURATION
// --------------------------

/**
 * Fetch the global system configuration, primarily containing the stack lists.
 * @returns {Promise<{success: boolean, data: any} | {success: boolean, message: string}>}
 */
export const systemConfig = async () => {
  try {
    const res = await api.get("/stack/system_config");
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Fetch System Config Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch system configuration.",
    };
  }
};