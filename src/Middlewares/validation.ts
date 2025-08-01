import { param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const reviewValidator = [
  param("reviewId")
    .notEmpty()
    .withMessage("reviewId가 없습니다.")
    .isInt()
    .withMessage("id가 숫자여야 합니다."),
];

export const checklistValidator = [
  param("checklistId")
    .notEmpty()
    .withMessage("checklistId가 없습니다.")
    .isInt()
    .withMessage("id가 숫자여야 합니다."),
];

export const handleValidationResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedError = errors.array().map((err) => err.msg);
    console.log(extractedError);
    return next(new Error("InputValidation"));
  }
  next();
};
