import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../lib/axios";
import { tokenStore } from "../lib/authToken";
import { setupInterceptors } from "../lib/interceptor";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  accessToken?: string;
  refresh: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Setup interceptors
  useEffect(() => {
    setupInterceptors();

      // const initializeAuth = async () => {
      //   try {
      //     const res = await api.post("/auth/refresh"); // refresh token from cookie
      //     const token = res.data.accessToken;
      //     tokenStore.set(token);

      //     const userRes = await api.get("/auth/me"); // fetch user info
      //     setUser(userRes.data);
      //   } catch {
      //     tokenStore.set(null);
      //     setUser(null);
      //   } finally {
      //     setLoading(false);
      //   }
      // };

      // initializeAuth();
    }, []);

  const register = async (name: string, email: string, password: string) => {
  setLoading(true);
  try {
    const { data } = await api.post('/auth/register', { name, email, password}, { withCredentials: true });
    setUser(data.user); // assume backend returns { user, token? }
  } catch (err: any) {
    console.error('Registration failed:', err.response?.data?.message || err.message);
    throw err; // rethrow so UI can show error
  } finally {
    setLoading(false);
  }
};


  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password }, {});
      const token = res.data.accessToken;
      tokenStore.set(token);

      
      setUser(res.data.user);
    } catch (err) {
      tokenStore.set(null);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // clear refresh token cookie
    } catch {
       tokenStore.set(null);
    setUser(null);
    }
   
  };
  const refresh = async () => {
  setLoading(true);
  try {
    const { data } = await api.post('/auth/refresh', {}, { withCredentials: true });
    setUser(data.user); // assuming your backend returns user in data.user
  } catch (err) {
    setUser(null);
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
