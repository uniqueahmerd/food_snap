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

app.set("trust proxy", 1); // needed on Render / Heroku / cloud proxies

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Enable CORS for your frontend with proper options
const getCorsOrigins = () => {
  const origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];

  // Add production frontend URL
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  // Add Vercel frontend if different from FRONTEND_URL
  if (!origins.includes("https://food-snap-frontend.vercel.app")) {
    origins.push("https://food-snap-frontend.vercel.app");
  }

  return origins;
};

app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

/* ----------------------------- Application Routes ----------------------------- */

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
