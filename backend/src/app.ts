import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import foodRoutes from "./routes/food.routes.js";
import DashboardRouter from "./routes/Dashboard.routes.js";
import userRouter from "./modules/user/user.routes.js";

dotenv.config();
const app = express();

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
const url = "https://food-snap-frontend.vercel.app/"
app.use(
  cors({
    origin: url || "http://localhost:5173" , // Vite default
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.header("Vary", "Origin");
//   next();
// });


app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
