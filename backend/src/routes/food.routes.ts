import { Router } from "express";
import multer from "multer";
import { analyzeFood, getHistory } from "../controllers/food.controller";
import { authenticate, authorize } from "../midddleware/auth.middleware";

const router = Router();
const upload = multer({ dest: "uploads/" });

// router.post("/analyze", upload.single("image"), analyzeFood);
router.post("/analyze", authenticate, authorize("user"), analyzeFood);
router.get("/history", authenticate, authorize("user"), getHistory);


export default router;
