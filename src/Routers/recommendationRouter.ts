import { Router } from "express";
import recommendationController from "../controllers/recommendation.controller.js";

const router: Router = Router();

router.post("/", recommendationController.getRecommendedItems);

export default router;
