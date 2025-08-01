import { Request, Response, NextFunction } from "express";

export default function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (err.message) {
    case "UserNotFound":
      return res.status(404).send({ message: "사용자를 찾을 수 없음" });
    case "DataBaseError":
      return res.status(500).send({ message: "데이터베이스 오류" });
    case "ChecklistNotFound":
      return res.status(404).send({ message: "체크리스트를 찾을 수 없음" });
    case "ReviewNotFound":
      return res.status(404).send({ message: "리뷰를 찾을 수 없음" });
    default:
      return res.status(500).json({ message: "서버 오류" });
  }
}
