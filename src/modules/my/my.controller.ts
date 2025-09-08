// src/modules/my/my.controller.ts
import { NextFunction, Request, Response } from "express";
import UserService from "./my.service.js";
import { getProfilePhotoPath } from "../../middlewares/upload.js";
import { ChangedChecklistItems } from "../../types/checklist.js";
import { UpdatedUserInfo } from "../../types/user.js";
import { PackingBag, TravelType } from "@prisma/client";

/** Controller -> Service 로 넘길 생성 페이로드 타입(서비스 시그니처와 동일) */
type CreateChecklistPayload = {
  userId: number;
  title: string;
  travelType: TravelType;
  cityId: number;
  travelStart: Date;
  travelEnd: Date;
  items: { itemId: number; packingBag: PackingBag }[];
};

/** 문자열 → TravelType 캐스팅 (유효하지 않으면 기본 ACTIVITY) */
function toTravelType(value: unknown): TravelType {
  if (typeof value === "string" && (value as string) in TravelType) {
    return value as TravelType;
  }
  return TravelType.ACTIVITY;
}

/** (string|null|undefined) → (string|undefined) */
function toDefinedString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/** items 정규화: category('기내'|'위탁') 또는 packingBag('HAND'|'HOLD') 허용 */
function normalizeItems(
  input: unknown
): { itemId: number; packingBag: PackingBag }[] {
  if (!Array.isArray(input)) return [];
  const out = input
    .map((raw: unknown) => {
      const it = raw as Record<string, unknown> | undefined;
      const itemId = Number(it?.itemId);
      // 우선 순위: packingBag -> category
      const pb = it?.packingBag ?? (it as any)?.packing_bag;
      let bag: PackingBag | undefined;

      if (pb === "HAND" || pb === "HOLD") {
        bag = pb as PackingBag;
      } else {
        const category = it?.category;
        if (category === "기내") bag = PackingBag.HAND;
        if (category === "위탁") bag = PackingBag.HOLD;
      }

      if (!itemId || !bag) return null;
      return { itemId, packingBag: bag };
    })
    // 타입 가드로 null 제거
    .filter(
      (v): v is { itemId: number; packingBag: PackingBag } => v !== null
    );

  return out;
}

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /** 개인정보 조회 */
  getPersonalInfo = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const publicPersonalInfo = await this.userService.getPublicPersonalInfo(
      userId
    );
    // 프론트가 사용하는 키(data.publicUserInfo)로 래핑
    return res.status(200).send({ data: { publicUserInfo: publicPersonalInfo } });
  };

  /** 개인정보 수정 */
  updatePersonalInfo = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const body = req.body as Record<string, unknown>;

    // 업로드가 있으면 파일 경로, 없으면 body 값(문자열만) 사용
   const bodyProfile = toDefinedString(body.profilePhoto);
   const profilePhoto: string | undefined = req.file
    ? (getProfilePhotoPath(req.file.filename) ?? undefined) // ← 여기!
    : bodyProfile;

    const updatedInfo: UpdatedUserInfo = {
      nickname: toDefinedString(body.nickname),
      birthDate:
        typeof body.birthDate === "string" || body.birthDate instanceof Date
          ? new Date(body.birthDate as string)
          : undefined,
      profilePhoto, // string | undefined
    };

    const updatedUser = await this.userService.updatePersonalInfo(
      userId,
      updatedInfo
    );
    return res.status(200).send({ updatedUser });
  };

  /** 전체 준비물 리뷰 조회 */
  getAllReviews = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const reviews = await this.userService.getAllReviews(userId);
    return res.status(200).send({ reviews });
  };

  /** 개별 준비물 리뷰 조회 */
  getReviewByReviewId = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const reviewId = Number(req.params.reviewId);
    const review = await this.userService.getReviewByReviewId(
      userId,
      reviewId
    );
    return res.status(200).send({ review });
  };

  /** 내가 공유한 체크리스트 전체 조회 */
  getSharedChecklists = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const sharedChecklists = await this.userService.getSharedChecklists(userId);
    return res.status(200).send({ sharedChecklists });
  };

  /** 내가 공유한 개별 체크리스트 조회 */
  getSharedChecklist = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const checklistId = Number(req.params.checklistId);
    const sharedChecklist = await this.userService.getSharedChecklist(
      userId,
      checklistId
    );
    return res.status(200).send({ sharedChecklist });
  };

  /** 전체 체크리스트 조회 */
   getChecklistsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: "로그인이 필요합니다." });
      const userId = req.user.userId;
      const rows = await this.userService.getChecklistsByUserId(userId);

      // ❗여기서 rows.length === 0 이어도 절대 throw 하지 말고 200으로 반환
      return res.status(200).json({ checklists: rows });
    } catch (err) {
      next(err); // 원본 에러 전달
    }
  };

  /** 개별 체크리스트 조회 (헤더 메타 + itemRes 포함) */
  getChecklistByChecklistId = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const checklistId = Number(req.params.checklistId);
    const checklist = await this.userService.getChecklistByReviewId(
      userId,
      checklistId
    );
    return res.status(200).send({ checklist });
  };

  /** 체크리스트 생성 */
  createChecklist = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const body = req.body as Record<string, unknown>;

    const title = toDefinedString(body.title);
    const travelType = body.travelType;
    const cityId = Number(body.cityId);
    const travelStart = body.travelStart as string | Date | undefined;
    const travelEnd = body.travelEnd as string | Date | undefined;

    if (!title || !travelType || !cityId || !travelStart || !travelEnd) {
      return res.status(400).json({ message: "필수 필드 누락" });
    }

    const travelTypeEnum = toTravelType(travelType);
    const items = normalizeItems(body.items);

    const payload: CreateChecklistPayload = {
      userId,
      title,
      travelType: travelTypeEnum,
      cityId,
      travelStart: new Date(travelStart),
      travelEnd: new Date(travelEnd),
      items,
    };

    const checklistId = await this.userService.createChecklist(payload);
    return res.status(201).json({ checklistId });
  };

  /** 체크리스트 수정 (추가/삭제/가방변경) */
  updateChecklist = async (req: Request, res: Response) => {
    const checklistId = Number(req.params.checklistId);
    const body = req.body as Record<string, unknown>;

    // addedItems: [{ itemId, packingBag? | category? }]
    const addedItems =
      Array.isArray(body.addedItems) ? (body.addedItems as unknown[]) : [];

    const normalizedAdded = addedItems
      .map((raw): { itemId: number; packingBag: PackingBag } | null => {
        const it = raw as Record<string, unknown>;
        const itemId = Number(it.itemId);
        let bag: PackingBag | undefined;

        if (it.packingBag === "HAND" || it.packingBag === "HOLD") {
          bag = it.packingBag as PackingBag;
        } else if (it.category === "기내") {
          bag = PackingBag.HAND;
        } else if (it.category === "위탁") {
          bag = PackingBag.HOLD;
        }

        if (!itemId || !bag) return null;
        return { itemId, packingBag: bag };
      })
      .filter(
        (v): v is { itemId: number; packingBag: PackingBag } => v !== null
      );

    const removedItems = Array.isArray(body.removedItems)
      ? (body.removedItems as unknown[])
          .map((id) => Number(id))
          .filter((n): n is number => Number.isFinite(n))
      : [];

    const packingBagChangedItems = Array.isArray(body.packingBagChangedItems)
      ? (body.packingBagChangedItems as unknown[])
          .map((id) => Number(id))
          .filter((n): n is number => Number.isFinite(n))
      : [];

    const change: ChangedChecklistItems = {
      addedItems: normalizedAdded,
      removedItems,
      packingBagChangedItems,
    };

    await this.userService.updateChecklist(checklistId, change);
    return res.status(200).send({ message: "수정 완료" });
  };

  /** 체크리스트 삭제 (soft-delete) */
  deleteChecklist = async (req: Request, res: Response) => {
    const checklistId = Number(req.params.checklistId);
    await this.userService.deleteChecklist(checklistId);
    return res
      .status(200)
      .send({ message: "체크리스트 soft-delete 완료", deletedId: checklistId });
  };
}

export default new UserController();
