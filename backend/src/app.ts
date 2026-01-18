import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";

import userRouter from "./modules/user/user.routes.js";
import foodRouter from "./modules/food/food.routes.js";
import DashboardRouter from "./routes/Dashboard.routes.js";

dotenv.config();
const app = express();


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




app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
