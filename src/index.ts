import express, { Express } from "express";
import ItemConditionRepository from "./Repositories/itemCondition.repository.js";
import RecommendationService from "./Services/recommendation.service.js";
import RecommendationController from "./Controllers/recommendation.controller.js";
import recommendationRouter from "./Routers/recommendationRouter.js";
import cors from "cors";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const itemConditionRepository = new ItemConditionRepository();

const recommendationService = new RecommendationService(
  itemConditionRepository
);

const recommendationController = new RecommendationController(
  recommendationService
);

app.use("/recommendations", recommendationRouter(recommendationController));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
