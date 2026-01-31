// IMPORTS 
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../lib/axios";
import { useAuth } from "./AuthContext";

// TYPES 
type Summary = {
  averageCalories: number;
  caloriesTarget: number;
  healthScore: number;
  mealsLogged: number;
  goalsMet: string;
};

type RecentScan = {
  food_name: string;
  confidence: number;
  calories: number;
  risk_level: "low" | "medium" | "high";
  scanned_at: string;
  health_condition: string
};

type WeeklyTrend = {
  day: string;
  calories: number;
};

type NutritionBreakdown = {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
};

interface DashboardContextType {
  summary: Summary | null;
  recentScans: RecentScan[];
  weeklyTrend: WeeklyTrend[];
  nutritionBreakdown: NutritionBreakdown | null;
  healthRisk: object[];
  loading: boolean;
  error: string | null;
  loadDashboardData: () => Promise<void>;
}

// CONTEXT 

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// PROVIDER 
export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // track user instead of accessToken

  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);
  const [nutritionBreakdown, setNutritionBreakdown] = useState<NutritionBreakdown | null>(null);
  const [healthRisk, setHealthRisk] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOAD DASHBOARD DATA
  const loadDashboardData = useCallback(async () => {
    if (!user) return; // don't load if not logged in
    setLoading(true);
    setError(null);

    try {
      const [
        summaryRes,
        recentScansRes,
        weeklyTrendRes,
        nutritionBreakdownRes,
        healthRiskRes,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/recent-scans"),
        api.get("/dashboard/weekly-trend"),
        api.get("/dashboard/nutrition-breakdown"),
        api.get("/dashboard/health-risk"),
      ]);
       
      setSummary(summaryRes.data);
      setRecentScans(recentScansRes.data);
      setWeeklyTrend(weeklyTrendRes.data);
      setNutritionBreakdown(nutritionBreakdownRes.data);
      setHealthRisk(healthRiskRes.data);
    } catch (err: any) {
      console.error("Dashboard load failed:", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 🔹 Effect: auto-load dashboard when user logs in
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  /* ===================== VALUE ===================== */
  const value: DashboardContextType = {
    summary,
    recentScans,
    weeklyTrend,
    nutritionBreakdown,
    healthRisk,
    loading,
    error,
    loadDashboardData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/* ===================== HOOK ===================== */
export const useDashboardData = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "useDashboardData must be used within DashboardProvider"
    );
  }
  return context;
};
