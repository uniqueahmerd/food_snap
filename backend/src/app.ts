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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Enable CORS for your frontend with proper options
const CORS_OPTIONS = [
  "http://localhost:5173",
  "https://food-snap-frontend.vercel.app",
]
app.use(
  cors({
    origin: CORS_OPTIONS,
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
