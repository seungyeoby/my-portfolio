import Router from "express";
import type ItemController from "../Controllers/items.controller.js";

export default function itemRouter(itemController: ItemController) {
  const router = Router();

  // 전체 아이템 조회
  router.get("/", itemController.getWholeItems);

  // 많이 클릭된 아이템 순으로 조회
  router.get("/most-clicked", itemController.getItemsByClickCountDesc);

  return router;
}
