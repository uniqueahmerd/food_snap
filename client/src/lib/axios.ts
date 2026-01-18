import axios from "axios";
// import { tokenStore } from "./authToken";

// const BASE_URL = process.env.BACKEND_URL;
const BASE_URL = "https://food-snap-backend.vercel.app/api/v1/";
// const BASE_URL = "http://localhost:5000/api/v1/";

const api = axios.create({
  baseURL: BASE_URL, 
  withCredentials: true,
});

export default api;
