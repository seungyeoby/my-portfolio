import express, { Express } from "express";
import recommendationRouter from "./Routers/recommendationRouter.js";
import cors from "cors";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use("/recommendations", recommendationRouter);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
