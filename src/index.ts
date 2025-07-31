import express, { Express } from "express";
import cors from "cors";
import ChecklistsRepository from "./Repositories/checklist.repository.js";
import ChecklistItemsRepository from "./Repositories/checklistItems.repository.js";
import ReviewsRepository from "./Repositories/reviews.repository.js";
import UserRepository from "./Repositories/user.repository.js";
import UserService from "./Services/user.service.js";
import UserController from "./Controllers/user.controller.js";
import userRouter from "./Routers/userRouter.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const checklistsRepository = new ChecklistsRepository();
const checklistItemsRepository = new ChecklistItemsRepository();
const reviewsRepository = new ReviewsRepository();
const userRepository = new UserRepository();

const userService = new UserService(
  userRepository,
  checklistItemsRepository,
  checklistsRepository,
  reviewsRepository
);

const userController = new UserController(userService);

app.use("/my", userRouter(userController));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
