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


const allowedOrigins = [
  "http://localhost:5173",
  "https://food-snap-frontend.vercel.app",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true, // REQUIRED for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));




app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
