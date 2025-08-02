import RecommendationService from "./recommendation.service.js";
import { Answer, RecommendedItems } from "../types/answer.js";
import { Request, Response } from "express";

class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  getRecommendedItems = async (req: Request, res: Response) => {
    const answer: Answer = req.body;
    const recommendedItems: RecommendedItems =
      await this.recommendationService.getRecommendedItemIds(answer);
    return res.status(200).send(recommendedItems);
  };
}

export default new RecommendationController();
