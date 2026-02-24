import api from "../lib/axios";
import { useAuth } from "../contexts/AuthContext";

export const useRefreshToken = () => {
  const { setAccessToken } = useAuth();

  return async () => {
    const res = await api.post("/auth/refresh");
    setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  };
};
  