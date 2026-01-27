import axios from "axios";
// import { tokenStore } from "./authToken";

// Use environment variable if available, otherwise default to localhost
const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/v1/";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
