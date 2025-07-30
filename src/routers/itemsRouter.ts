import Router from "express";
import ItemController from "../Controllers/items.controller.js";
const router = Router();

// 전체 아이템 조회
router.get("/", ItemController.getWholeItems);

// 많이 클릭된 아이템 순으로 조회
router.get("/most-clicked", ItemController.getItemsByClickCountDesc);

export default router;
