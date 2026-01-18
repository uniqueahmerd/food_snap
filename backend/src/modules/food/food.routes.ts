import {Router} from "express";
import { authenticate, authorize } from "../../midddleware/auth.middleware.js";
import { analyze } from "./food.controller.js";


const foodRouter = Router();

foodRouter.post("/analyze", authenticate, authorize("user"), analyze);

export default foodRouter;