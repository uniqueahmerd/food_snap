import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import foodRoutes from "./routes/food.routes";
import AuthRouter from "./routes/Auth.route";
import DashboardRouter from "./routes/Dashboard.routes";

dotenv.config();
const app = express();
app.use(helmet());
app.use(express.json()); // VERY IMPORTANT limit: "10mb"
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default
    credentials: true,
  })
);

app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
