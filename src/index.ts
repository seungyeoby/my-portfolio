import express, { Express, Request, Response } from "express";
import cors from "cors";

const app: Express = express();
const PORT: 4000 = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
