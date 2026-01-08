import axios from "axios";
// import { tokenStore } from "./authToken";

const api = axios.create({
  baseURL: process.env._BACKEND_URL || "http://localhost:5000/api/v1", 
  withCredentials: true,
});

export default api;
