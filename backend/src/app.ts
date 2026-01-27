import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

//local imports
import userRouter from "./modules/user/user.routes.js";
import foodRouter from "./modules/food/food.routes.js";
import DashboardRouter from "./routes/Dashboard.routes.js";

dotenv.config();

const app = express();

// Get allowed origins from environment variable or use defaults based on environment
let allowedOrigins: string[] = [];

if (process.env.NODE_ENV === "production") {
  // In production, be restrictive but include common Vercel domains
  allowedOrigins = [
    "https://food-snap-frontend.vercel.app",
    "https://*.vercel.app", // Allow any Vercel deployment
  ];
  
  // Add specific frontend URL if set
  if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  
  // Add any additional origins from ALLOWED_ORIGINS env var
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
    allowedOrigins.push(...additionalOrigins);
  }
} else {
  // In development, allow localhost and any from ALLOWED_ORIGINS
  allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ];
  
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
    allowedOrigins.push(...additionalOrigins);
  }
}

console.log("🔓 Allowed CORS Origins:", allowedOrigins);
console.log("📌 Running in:", process.env.NODE_ENV || "development");

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests with no origin
      return callback(null, true);
    }

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check wildcard match for Vercel
    if (allowedOrigins.some(allowed => {
      if (allowed.includes("*")) {
        const pattern = allowed.replace("*", ".*");
        return new RegExp(pattern).test(origin);
      }
      return false;
    })) {
      return callback(null, true);
    }

    console.warn(`⚠️ CORS request from unauthorized origin: ${origin}`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length", "X-JSON-Response"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
