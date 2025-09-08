import { Request, Response, NextFunction } from "express";

export default function (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  const codeMap: Record<string, number> = {
    // 공통
    InputValidation: 400,
    DataBaseError: 500,
    Forbidden: 403,
    UserNotFound: 404,
    UserInfoNotFound: 404,

    // 인증/인가
    AuthenticationError: 403, // 로그인은 되어있으나 권한 없음

    // 체크리스트/공유
    ChecklistNotFound: 404,
    DeleteChecklistError: 400,
    AlreadyShared: 409,
    AlreadyUnshared: 409,
    ShareChecklistError: 404,

    // 후기/찜
    CreateItemReviewError: 400,
    ItemReviewNotFound: 404,
    patchItemReviewError: 400,
    deleteItemReviewError: 400,
    likesError: 500,
    AddFavoriteItemReviewError: 400,
    GetFavoriteItemReviewsError: 500,
    GetFavoriteItemReviewByIdError: 404,
    DeleteFavoriteItemReviewError: 400,

    // 계정
    PasswordError: 400,
    EmailAlreadyExists: 409,
    NicknameAlreadyExists: 409,
  };

  const msgMap: Record<string, string> = {
    DataBaseError: "데이터베이스 오류",
    Forbidden: "권한이 없습니다.",
    AuthenticationError: "해당 체크리스트를 공유할 권한이 없습니다.",
    ChecklistNotFound: "체크리스트를 찾을 수 없음",
    DeleteChecklistError: "이미 삭제된 체크리스트",
    AlreadyShared: "이미 공유된 체크리스트입니다.",
    AlreadyUnshared: "이미 공유 해제된 체크리스트입니다.",
    ShareChecklistError: "공유된 체크리스트를 찾을 수 없음",
    CreateItemReviewError: "준비물 후기 작성 실패",
    ItemReviewNotFound: "준비물 후기 조회 실패",
    patchItemReviewError: "준비물 후기 수정 실패",
    deleteItemReviewError: "준비물 후기 삭제 실패",
    likesError: "좋아요 추가/취소 실패",
    AddFavoriteItemReviewError: "준비물 후기 찜 실패",
    GetFavoriteItemReviewsError: "찜한 준비물 후기 조회 실패",
    GetFavoriteItemReviewByIdError: "개별 찜한 준비물 후기 조회 실패",
    DeleteFavoriteItemReviewError: "준비물 후기 찜 취소 실패",
    UserNotFound: "사용자를 찾을 수 없음",
    UserInfoNotFound: "일치하는 정보를 찾을 수 없습니다",
    PasswordError: "일치하지 않는 비밀번호",
    EmailAlreadyExists: "이미 사용 중인 이메일입니다.",
    NicknameAlreadyExists: "이미 사용 중인 닉네임입니다.",
    InputValidation: "입력 정보를 확인해주세요",
  };

  const key = err?.message ?? "Unknown";
  const status = codeMap[key] ?? 500;
  const message = msgMap[key] ?? "서버 오류";

  return res.status(status).json({ message });
}
