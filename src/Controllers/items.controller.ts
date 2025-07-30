import ItemService from "../Services/items.service.js";
import { Request, Response } from "express";

class ItemController {
  async getWholeItems(req: Request, res: Response) {
    const result = await ItemService.getWholeItems();
    return res.status(200).send(result);
  }

  async getItemsByClickCountDesc(req: Request, res: Response) {
    const result = await ItemService.getItemsByClickCountDesc();
    return res.status(200).send(result);
  }
}

export default new ItemController();
