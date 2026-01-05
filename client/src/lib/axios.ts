import axios from "axios";
// import { tokenStore } from "./authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api/v1", 
  withCredentials: true,
});

export default api;
