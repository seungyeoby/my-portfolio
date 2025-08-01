import { Request, Response, NextFunction } from "express";

export default function (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (err.message) {
    case "DataBaseError":
      return res.status(500).send({ message: "데이터베이스 오류" });
    default:
      return res.status(500).json({ message: "서버 오류" });
  }
}
