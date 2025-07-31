import { Router } from "express";
import type RecommendationController from "../Controllers/recommendation.controller.js";

export default function recommendationRouter(
  recommendationController: RecommendationController
) {
  const router: Router = Router();

  router.post("/", recommendationController.getRecommendedItems);

  return router;
}
