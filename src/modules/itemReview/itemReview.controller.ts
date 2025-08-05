import { Request, Response, NextFunction } from 'express';
import { ItemReviewService } from './itemReview.service.js';
import type { ReviewQuery, AuthRequest } from '../../types/itemReview.js'; 

class ItemReviewController {
  private service = new ItemReviewService();

createItemReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, checklistId, itemId } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: '권한 없음' });
    }

    const image = req.file?.filename ?? null;

    const review = await this.service.createItemReview({
      title,
      content,
      checklistId: Number(checklistId),
      itemId: Number(itemId),
      image,
      userId: Number(userId),
    });

    res.status(201).json(review);
  } catch (error) {
    next(new Error("CreateItemReviewError"));
  }
};


getAllItemReviews = async (req: Request, res: Response, next: NextFunction) => {
  const { sort = 'likes', categoryId } = req.query as ReviewQuery;
  try {
    const result = await this.service.getAllItemReviews({ sort, categoryId });
    res.status(200).json(result);
  } catch (error) {
    next(new Error("ItemReviewNotFound"));
  }
};


  getItemReviewById = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = Number(req.params.reviewId);
    try {
      const review = await this.service.getItemReviewById(reviewId);
      res.status(200).json(review);
    } catch (error) {
      next(new Error("ItemReviewNotFound"));
    }
  };

  updateItemReview = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = Number(req.params.reviewId);
    const { title, content, image, checklistId, itemId } = req.body;
    
 if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const updated = await this.service.updateItemReview(
      reviewId,
      { title, content, image, checklistId, itemId },
      req.user
    );
    res.status(200).json({ message: '후기 수정 완료', review: updated });
  } catch (error) {
    next(new Error("patchItemReviewError"));
  }
};

  deleteItemReview = async (req: Request, res: Response, next: NextFunction) => {
    const reviewId = Number(req.params.reviewId);

  if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    await this.service.deleteItemReview(reviewId, req.user);
    res.status(200).json({ message: '후기가 삭제되었습니다.' });
  } catch (error) {
    next(new Error("deleteItemReviewError"));
  }
}

getTopLikedReviewSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await this.service.getTopLikedReviewSummary();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

}
export default new ItemReviewController();
