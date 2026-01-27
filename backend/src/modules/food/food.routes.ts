import {Router} from "express";

// local imports
import { analyze, mealHistory } from "./food.controller.js";
import { authenticate, authorize } from "../../midddleware/auth.middleware.js";


const foodRouter = Router();

foodRouter.post("/analyze", authenticate, authorize("user"), analyze);
foodRouter.post("/history", authenticate, authorize("user"), mealHistory);

export default foodRouter;