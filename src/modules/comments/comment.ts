import { Pagination, Query, ResType } from 'common/types';

export const likeStatuses = ['None', 'Like', 'Dislike'] as const;
type LikeStatus = typeof likeStatuses[number];

export type LikesInfo = { likesCount: number; dislikesCount: number; myStatus: LikeStatus };

export type Reaction = { userId: string; status: LikeStatus; createdAt: string };

export type ReqBodyLikeStatus = { likeStatus: LikeStatus };

export type Comment = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type CommentDB = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  postId: string;
  reactions: Reaction[];
};

export type ReqBodyComment = { content: string; postId: string };

export type ParamComment = { commentId: Comment['id'] };

export type ReqQueryComment = Query & { postId?: string };

export type ResComment = ResType<Comment>;

export type ResComments = ResType<Pagination<Comment>>;
