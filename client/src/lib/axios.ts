import axios from "axios";
// import { tokenStore } from "./authToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY,
  withCredentials: true,
});

export default api;
