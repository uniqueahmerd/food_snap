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

const allowedOrigins = [
  "http://localhost:5173",
  "https://food-snap-frontend.vercel.app",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", userRouter);
app.use("/api/v1/food", foodRouter);
app.use("/api/v1/dashboard", DashboardRouter);

export default app;
