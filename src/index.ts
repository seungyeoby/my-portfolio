import express, { Express } from "express";
import cors from "cors";
import itemsRouter from "./Routers/itemsRouter.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/items", itemsRouter);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
