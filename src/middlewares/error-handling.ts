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
    case "PasswordError":
      return res.status(400).send({
        errorMessage: "일치하지 않는 비밀번호",
      });
    case "ChecklistNotFound":
      return res.status(404).send({ message: "체크리스트를 찾을 수 없음" });
    case "ReviewNotFound":
      return res.status(404).send({ message: "리뷰를 찾을 수 없음" });
    case "CreateItemReviewError":
      return res.status(400).json({ message: "준비물 후기 작성 실패" });
    case "ItemReviewNotFound":
      return res.status(404).json({ message: "준비물 후기 조회 실패" });
    case "patchItemReviewError":
      return res.status(400).json({ message: "준비물 후기 수정 실패" });
    case "deleteItemReviewError":
      return res.status(400).json({ message: "준비물 후기 삭제 실패" });
    case "likesError":
      return res.status(500).json({ message: "좋아요 추가/취소 실패" });
    case "AuthenticationError":
      return res.status(401).json({ message: "해당 권한이 없음" });
    case "UserNotFound":
      return res.status(404).json({ message: "사용자를 찾을 수 없음" });
    case "AddFavoriteItemReviewError":
      return res.status(400).json({ message: "준비물 후기 찜 실패" });
    case "GetFavoriteItemReviewsError":
      return res.status(500).json({ message: "찜한 준비물 후기 조회 실패" });
    case "GetFavoriteItemReviewByIdError":
      return res
        .status(404)
        .json({ message: "개별 찜한 준비물 후기 조회 실패" });
    case "DeleteFavoriteItemReviewError":
      return res.status(400).json({ message: "준비물 후기 찜 취소 실패" });
    case "DataBaseError":
      return res.status(500).json({ message: "데이터베이스 오류" });
    case "AlreadyFavorite":
      return res.status(400).json({ message: "이미 찜한 준비물 후기" });
    case "NotFavorite":
      return res.status(404).json({ message: "찜한 준비물 후기가 아님" });
    case "ChecklistNotFound":
      return res.status(404).json({ message: "체크리스트를 찾을 수 없음" });
    case "ShareChecklistError":
      return res
        .status(400)
        .json({ message: "공유된 체크리스트를 찾을 수 없음" });
    case "DeleteChecklistError":
      return res.status(400).json({ message: "이미 삭제된 체크리스트" });
    case "AlreadyShared":
      return res.status(400).json({ message: "이미 공유된 체크리스트" });
    case "FailShared":
      return res.status(500).json({ message: "체크리스트 공유 실패" });
    case "AlreadyUnshared":
      return res.status(400).json({ message: "이미 공유 해제된 체크리스트" });
    case "FailUnshared":
      return res.status(500).json({ message: "체크리스트 공유 해제 실패" });
    case "Forbidden":
      return res.status(403).json({ message: "권한이 없습니다." });
    case "EmailAlreadyExists":
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
    case "NicknameAlreadyExists":
      return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
    default:
      return res.status(500).json({ message: "서버 오류" });
  }
}
