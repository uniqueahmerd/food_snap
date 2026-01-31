import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
  refresh: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  accessToken?: string;
  error: string
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)

  // Setup interceptors and restore auth state on mount
  useEffect(() => {
    if (initialized) return; // Only initialize once

    setupInterceptors();

    let mounted = true; // Track if component is still mounted

    const initializeAuth = async () => {
      try {
        const res = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        ); // refresh token from cookie
        
        const token = res.data.accessToken;
        tokenStore.set(token);

        // User data is returned from refresh endpoint
        if (mounted && res.data.user) {
          setUser(res.data.user);
        }
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          tokenStore.set(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [initialized]);

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post(
        "/auth/register",
        { name, email, password },
        { withCredentials: true }
      );
      setUser(data.user); // assume backend returns { user, token? }
    } catch (err: any) {
      console.error(
        "Registration failed:",
        err.response?.data?.message || err.message
      );
      throw err; // rethrow so UI can show error
    } finally {
      setLoading(false);
    }
  };
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const token = res.data.accessToken;
      tokenStore.set(token);
      setUser(res.data.user);

      if (user?.role === "admin") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      console.log("role", user?.role);
      
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
      tokenStore.set(null);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      tokenStore.set(null);
      setUser(null);
    }
  };
  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      // Store access token
      if (data.accessToken) {
        tokenStore.set(data.accessToken);
      }

      // Set user data
      if (data.user) {
        setUser(data.user);
        setLoading(false); 
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("❌ Client: Refresh failed:", err.message);
      setUser(null);
      setLoading(false);
      throw err;
    }
  };
  const verifyEmail = async (email: string) => {
    setLoading(true);
    try {
      const res = await api.post(
        "/auth/verify-email",
        { email},
        { withCredentials: true }
      );
      setUser(res.data.user)
      setLoading(false)
    } catch (error: any) {
      setError(error.response.data.message)
      setLoading(false)
      throw error;
    }
  };
  const verifyOtp = async (otp: string) => {
    setLoading(true)
    try {
       await api.post(
        "/auth/verify-otp",
        {otp},
        {withCredentials: true}
      );
      setLoading(false)
    } catch (error: any) {
      setError(error.response.data)
      setLoading(false);
      throw error;
    }
  };
  const resetPassword = async (password: string) => {
     setLoading(true);
     try {
      await api.post(
      "/auth/reset-password",
      {password},
      {withCredentials: true}
     )
     } catch (error: any) {
      setError(error.response.data)
      setLoading(false);
      throw error;
     }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refresh, register, verifyEmail, verifyOtp, resetPassword, error, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
