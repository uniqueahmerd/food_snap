import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

//local imports
import userRouter from "./modules/user/user.routes.js";
import foodRouter from "./modules/food/food.routes.js";
import DashboardRouter from "./modules/dashboard/dashboard.routes.js";

dotenv.config();

const app = express();

// const corsOptions: cors.CorsOptions = {
//   origin: function (origin, callback) {
//     // console.log(`📨 Incoming request from origin: ${origin || "NO ORIGIN"}`);

//     // Always allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     // Allow any Vercel app
//     if (origin.includes("vercel.app")) {
//       // console.log(`✅ Allowed Vercel origin: ${origin}`);
//       return callback(null, true);
//     }

//     // Allow localhost in development
//     if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
//       // console.log(`✅ Allowed localhost origin: ${origin}`);
//       return callback(null, true);
//     }

//     // Allow specific frontend URL if set
//     if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
//       // console.log(`✅ Allowed configured frontend: ${origin}`);
//       return callback(null, true);
//     }

//     console.warn(`⚠️ CORS request DENIED from: ${origin}`);
//     callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//     "Accept",
//   ],
//   exposedHeaders: ["Content-Length", "X-JSON-Response"],
//   preflightContinue: false,
//   optionsSuccessStatus: 200,
// };

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Enable CORS for your frontend with proper options
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);


/* ----------------------------- Application Routes ----------------------------- */

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
