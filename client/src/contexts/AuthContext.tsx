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
  accessToken?: string;
  refresh: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to prevent immediate redirect
  const [initialized, setInitialized] = useState(false);

  // Setup interceptors and restore auth state on mount
  useEffect(() => {
    if (initialized) return; // Only initialize once

    setupInterceptors();

    let mounted = true; // Track if component is still mounted

    const initializeAuth = async () => {
      console.log("🚀 AuthProvider: Starting initializeAuth...");
      try {
        console.log("📡 AuthProvider: Calling /auth/refresh...");
        const res = await api.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        ); // refresh token from cookie
        const token = res.data.accessToken;
        console.log("✅ AuthProvider: Got token from refresh");
        tokenStore.set(token);

        // User data is returned from refresh endpoint
        if (mounted && res.data.user) {
          console.log("👤 AuthProvider: Setting user from refresh");
          setUser(res.data.user);
        }
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      } catch (err: any) {
        // 401 is expected when user is not logged in - no need to log this
        if (err?.response?.status !== 401) {
          console.error(
            "❌ AuthProvider: Auth initialization error:",
            err.message || err
          );
        } else {
          console.log("ℹ️ AuthProvider: No stored session (expected)");
        }
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
      mounted = false; // Cleanup function to prevent state updates after unmount
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
      console.log("🔄 Client: Calling refresh endpoint...");
      const { data } = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true }
      );
      console.log("✅ Client: Response received:", data);

      // Store access token
      if (data.accessToken) {
        console.log("💾 Client: Storing access token...");
        tokenStore.set(data.accessToken);
      }

      // Set user data
      if (data.user) {
        console.log("👤 Client: Setting user:", data.user);
        setUser(data.user);
        setLoading(false); // Only set loading to false after user is set
      } else {
        // If no user data returned, clear user and stop loading
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

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refresh, register }}
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
