import express, { Express } from "express";
import cors from "cors";
import userRouter from "./Routers/userRouter.js";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use("/my", userRouter);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
