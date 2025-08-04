export interface CreateItemReviewInput {
  title: string;
  content: string;
  checklistId: number;
  itemId: number;
  image?: string | null;
  userId: number;
}

export interface ReviewQuery {
  sort?: 'likes' | 'recent';
  categoryId?: string;
}

export interface UpdateItemReviewInput {
  title?: string;
  content?: string;
  checklistId?: number;
  itemId?: number;
  image?: string | null;
}

export interface JWTPayload {
  userId: number;
  authority: 'USER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
