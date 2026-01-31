import {Router} from "express";

// local imports
import { analyze, mealHistory } from "./food.controller.js";
import { authenticate, authorize } from "../../midddleware/auth.middleware.js";


const foodRouter = Router();

foodRouter.post("/analyze", authenticate, analyze);
foodRouter.post("/history", authenticate, mealHistory);

export default foodRouter;