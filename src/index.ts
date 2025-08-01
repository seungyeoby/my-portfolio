import express, { Express } from "express";
import cors from "cors";
import itemRouter from "./items/items.router.js";
import errorHandlingMiddleware from "./middlewares/error-handling.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/items", itemRouter);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
