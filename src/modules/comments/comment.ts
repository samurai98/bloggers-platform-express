import { Pagination, Query, ResType } from '../../common/types/common';
import { LikesInfo, ReactionDB } from '../../common/types/reactions';

type CommonComment = {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
};

export type Comment = CommonComment & { userLogin: string; likesInfo: LikesInfo };

export type CommentDB = CommonComment & { postId: string; reactions: ReactionDB[] };

export type ReqBodyComment = { content: string; postId: string };

export type ReqQueryComment = Query & { postId?: string };

export type ResComment = ResType<Comment>;

export type ResComments = ResType<Pagination<Comment>>;
