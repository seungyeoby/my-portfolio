import { Router } from "express";
import citiesController from "./cities.controller.js";

const router: Router = Router();

// 도시 조회
router.get("/", citiesController.getWholeCities);

export default router;
