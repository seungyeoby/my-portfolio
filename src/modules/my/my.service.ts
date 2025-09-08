import UserRepository from "../../repositories/user.repository.js";
import ChecklistItemsRepository from "../../repositories/checklistItems.repository.js";
import ItemReviewRepository from "../../repositories/itemReview.repository.js";
import ChecklistsRepository from "../../repositories/checklist.repository.js";
import ItemsRepository from "../../repositories/items.repository.js";

import {
  Checklist,
  ChangedChecklistItems,
  ChecklistDTO,
} from "../../types/checklist.js";
import { UpdatedUserInfo } from "../../types/user.js";
import { PackingBag, TravelType } from "@prisma/client";
import { deleteFile } from "../../middlewares/upload.js";
import path from "path";

type CreateChecklistPayload = {
  userId: number;
  title: string;
  travelType: TravelType;
  cityId: number;
  travelStart: string | Date;
  travelEnd: string | Date;
  items: { itemId: number; packingBag: PackingBag }[];
};

export default class UserService {
  private userRepo: UserRepository;
  private checklistItemsRepo: ChecklistItemsRepository;
  private checklistsRepo: ChecklistsRepository;
  private reviewsRepo: ItemReviewRepository;
  private itemRepo: ItemsRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.checklistItemsRepo = new ChecklistItemsRepository();
    this.checklistsRepo = new ChecklistsRepository();
    this.reviewsRepo = new ItemReviewRepository();
    this.itemRepo = new ItemsRepository();
  }

  /** 개인정보 조회 */
  async getPublicPersonalInfo(userId: number) {
    let userInfo = await this.userRepo.getPublicPersonalInfo(userId);
    if (!userInfo) throw new Error("UserNotFound");

    const isAbs = (s?: string | null) => !!s && /^https?:\/\//i.test(s);
    const toAbs = (s?: string | null) =>  !s ? s : isAbs(s) ? s : `http://localhost:4000${s}`;

    userInfo = {
      ...userInfo,
      profilePhoto: toAbs(userInfo.profilePhoto as any) as any,
       };

    const { password, userId: _omit, ...publicInfo } = userInfo as any;
    return publicInfo;
  }

  /** 개인정보 수정 */
  async updatePersonalInfo(userId: number, updatedInfo: UpdatedUserInfo) {
    if (updatedInfo.birthDate) {
      updatedInfo.birthDate = new Date(updatedInfo.birthDate);
    }

     // 새 프로필이 들어왔고, 이전 값이 "로컬 정적 경로"일 때만 삭제
    if (typeof updatedInfo.profilePhoto === "string") {
      const prev = await this.userRepo.getPublicPersonalInfo(userId);
      const prevPath = prev?.profilePhoto ?? "";
      const isLocalStatic = typeof prevPath === "string" && /^\/static\//.test(prevPath);
      // (같은 파일로 교체하는 경우 중복 삭제 방지)
      if (isLocalStatic && prevPath !== updatedInfo.profilePhoto) {
        const filename = path.basename(prevPath);
        deleteFile(filename);
      }
    }

    const updatedUser = await this.userRepo.updatePersonalInfo(
      userId,
      updatedInfo
    );
    const { password, userId: _omit, ...publicInfo } = updatedUser as any;
    return publicInfo;
  }

  /** 체크리스트 생성 → 생성된 checklistId 반환 */
  async createChecklist(payload: CreateChecklistPayload): Promise<number> {
    const { items, ...info } = payload;

    const checklistInfo: ChecklistDTO = {
      userId: info.userId,
      title: info.title,
      travelType: info.travelType, // Prisma enum
      cityId: Number(info.cityId),
      travelStart:
        typeof info.travelStart === "string"
          ? new Date(info.travelStart)
          : info.travelStart,
      travelEnd:
        typeof info.travelEnd === "string"
          ? new Date(info.travelEnd)
          : info.travelEnd,
    };

    // 저장(트랜잭션) + 생성된 ID 반환
    const checklistId = await this.checklistsRepo.saveChecklist(items, checklistInfo);

    // 아이템 클릭 카운트 증가(있다면)
    if (items?.length) {
      const itemIds = items.map((i) => i.itemId);
      await this.itemRepo.upClickCount(itemIds);
    }

    return checklistId;
  }

  /** 체크리스트 삭제(soft) */
  async deleteChecklist(checklistId: number) {
    await this.checklistsRepo.deleteChecklist(checklistId);
  }

  /** 전체 준비물 리뷰 조회 */
  async getAllReviews(userId: number) {
    return await this.reviewsRepo.getAllReviewsByUserId(userId);
  }

  /** 개별 리뷰 조회 */
  async getReviewByReviewId(userId: number, reviewId: number) {
    let review = await this.reviewsRepo.getReviewByReviewId(userId, reviewId);
    if (!review) throw new Error("ReviewNotFound");

    if (review.image) {
      review = { ...review, image: `http://localhost:4000${review.image}` };
    }
    return review;
  }

  /** 내 체크리스트 전체 조회 */
  async getChecklistsByUserId(userId: number) {
    try {
      const rows = await this.checklistsRepo.getChecklistsByUserId(userId);
      // ✅ 비어도 그냥 반환 (throw 금지)
      return rows;
    } catch {
      throw new Error("DataBaseError");
    }
  }

  /** 개별 체크리스트(헤더 메타 + itemRes) */
  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await this.checklistsRepo.getChecklistByChecklistId(
      userId,
      checklistId
    );
    if (!checklist) throw new Error("ChecklistNotFound");

    const { cities, ...flat } = checklist as any;
    const header = { ...flat, city: cities?.cityName ?? "" };

    const items = await this.checklistItemsRepo.getChecklistItems(checklistId);
    const itemRes = items.map((i) => ({
      checklistItemId: i.checklistItemId,
      itemId: i.item.itemId,
      itemLabel: i.item.itemLabel,
      packingBag: i.packingBag,
    }));

    return { ...header, itemRes };
  }

  /** 내가 공유한 체크리스트 목록 */
  async getSharedChecklists(userId: number) {
    const rows = await this.checklistsRepo.getSharedChecklistsByUserId(userId);

    // ✅ repo가 cityId만 주는 경우/ cities를 주는 경우 모두 커버
    return (rows as any[]).map((r) => ({
      checklistId: r.checklistId,
      title: r.title,
      travelType: r.travelType,
      travelStart: r.travelStart,
      travelEnd: r.travelEnd,
      createdAt: r.createdAt,
      content: r.content,
      likes: r.likes,
      city: r.cities?.cityName ?? "",              // 도시명(FE 표시에 유용)
      cityId: r.cityId ?? r.cities?.cityId ?? null // 타입 에러 방지용
    }));
  }

  /** 내가 공유한 개별 체크리스트 (권한 확인 포함) */
  async getSharedChecklist(userId: number, checklistId: number) {
    const chk = await this.checklistsRepo.getSharedChecklistByChecklistId(
      checklistId
    );
    if (!chk) throw new Error("ChecklistNotFound");

    // 본인 소유만 접근 가능하게 하려면 아래 검사 유지
    if ((chk as any).userId !== userId) {
      throw new Error("Forbidden");
    }

    return chk;
  }

  /** 체크리스트 수정(추가/삭제/가방 토글) */
  async updateChecklist(checklistId: number, change: ChangedChecklistItems) {
    if (change.addedItems?.length) {
      await this.checklistItemsRepo.addNewChecklistItems(
        change.addedItems,
        checklistId
      );

      const itemIds = change.addedItems.map((a) => a.itemId);
      await this.itemRepo.upClickCount(itemIds);
    }

    if (change.removedItems?.length) {
      await this.checklistItemsRepo.removeChecklistItems(change.removedItems);
    }

    if (change.packingBagChangedItems?.length) {
      const before = await this.checklistItemsRepo.getChecklistItemsByChecklistItemId(
        change.packingBagChangedItems
      );
      const updates = before.map(({ checklistItemId, packingBag }) => ({
        id: checklistItemId,
        newValue: packingBag === PackingBag.HAND ? PackingBag.HOLD : PackingBag.HAND,
      }));
      await this.checklistItemsRepo.updatePackingBag(updates);
    }
  }
}
