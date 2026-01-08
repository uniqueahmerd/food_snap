import axios from "axios";
// import { tokenStore } from "./authToken";

const api = axios.create({
  baseURL: process.env.BACKEND_URL, 
  withCredentials: true,
});

export default api;
