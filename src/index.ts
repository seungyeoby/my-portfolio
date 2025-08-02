import express, { Express } from "express";
import recommendationRouter from "./recommendations/recommendation.router.js";
import errorHandlingMiddleware from "./middlewares/error-handling.js";
import cors from "cors";
import myRouter from "./my/my.router.js";
import itemRouter from "./items/items.router.js";
import citiesRouter from "./cities/cities.router.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/my", myRouter);
app.use("/uploads", express.static("uploads"));
app.use("/recommendations", recommendationRouter);
app.use("/items", itemRouter);
app.use("/cities", citiesRouter);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
