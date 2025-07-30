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
}

export default new UserController();
