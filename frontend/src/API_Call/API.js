import axios from "axios";
// ("process.env.REACT_APP_API_BASE_URL");

const API_BASE_URL = "http://localhost:8000/api";
const API_TIMEOUT = 10000; // 10 seconds
const API_HEADERS = {
  "Content-Type": "application/json",
};

// Create an Axios instance with default configurations

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: API_HEADERS,
  withCredentials: true, // Add this line to send credentials with every request
});

export default api;
