import { Request, Response } from "express";
import userService from "../Services/user.service.js";
import { Checklist } from "../types/checklist.js";

class UserController {
  async createChecklist(req: Request, res: Response) {
    const checklist: Checklist = req.body;
    await userService.createChecklist(checklist);
    return res.status(201).send({
      message: "체크리스트 생성 완료",
    });
  }

  async deleteChecklist(req: Request, res: Response) {
    const checklistId: number = Number(req.params.checklistId);
    await userService.deleteChecklist(checklistId);
    return res.status(200).send({
      message: "체크리스트 soft-delete 완료",
      deletedId: checklistId,
    });
  }
}

export default new UserController();
