import axios from "axios";
// import { tokenStore } from "./authToken";

const api = axios.create({
  baseURL: process.env.BACKEND_URL || "https://food-snap-backend.vercel.app/api/v1",
  withCredentials: true,
});

export default api;
