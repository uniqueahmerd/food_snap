import { Router } from "express";
import { analyzeFood, getHistory } from "../controllers/food.controller.js";
import { authenticate, authorize } from "../midddleware/auth.middleware.js";

const router = Router();

router.post("/analyze", authenticate, authorize("user"), analyzeFood);
router.get("/history", authenticate, authorize("user"), getHistory);


export default router;
