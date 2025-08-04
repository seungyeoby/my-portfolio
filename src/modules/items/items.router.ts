import Router from "express";
import itemController from "./items.controller.js";

const router = Router();

// 전체 아이템 조회
router.get("/", itemController.getWholeItems);

// 많이 클릭된 아이템 순으로 조회
router.get("/most-clicked", itemController.getItemsByClickCountDesc);

export default router;
