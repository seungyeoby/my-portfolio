import express, { Express } from "express";
import cors from "cors";
import ItemCategoryRepository from "./Repositories/itemCategory.repository.js";
import ItemsRepository from "./Repositories/items.repository.js";
import ItemService from "./Services/items.service.js";
import ItemController from "./Controllers/items.controller.js";
import itemRouter from "./routers/itemsRouter.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const itemCategoryRepository = new ItemCategoryRepository();
const itemsRepository = new ItemsRepository();

const itemService = new ItemService(itemsRepository, itemCategoryRepository);

const itemController = new ItemController(itemService);

app.use("/items", itemRouter(itemController));

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
