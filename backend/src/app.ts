import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import foodRoutes from "./routes/food.routes.js";
import AuthRouter from "./routes/Auth.route.js";
import DashboardRouter from "./routes/Dashboard.routes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["https://food-snap-frontend.vercel.app", "http://localhost:5173"], // Vite default
   credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Vary", "Origin");
  next();
});


app.use(helmet());
app.use(express.json()); // VERY IMPORTANT limit: "10mb"
app.use(cookieParser());

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173" , // Vite default
//     credentials: true,
//   })
// );


app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
