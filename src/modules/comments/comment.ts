import { Pagination, Query, ResType } from "common/types";

export type Comment = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
};

export type CommentDB = Comment & { postId: string };

export type ReqBodyComment = {
  content: string;
  postId: string;
};

export type ParamComment = { commentId: Comment["id"] };

export type ReqQueryComment = Query & { postId?: string };

export type ResComment = ResType<Comment>;

export type ResComments = ResType<Pagination<Comment>>;
