import { Pagination, Query, ResType } from '../../common/types/common';
import { ExtendedLikesInfo, ReactionDB } from '../../common/types/reactions';

type CommonPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type Post = CommonPost & { extendedLikesInfo: ExtendedLikesInfo };

export type PostDB = CommonPost & { reactions: ReactionDB[] };

export type ReqBodyPost = { title: string; shortDescription: string; content: string; blogId: string };

export type ParamPost = { id: Post['id'] };

export type ReqQueryPost = Query & { blogId?: string };

export type ReqBodyCommentByPostId = { content: string };

export type ResPosts = ResType<Pagination<Post>>;

export type ResPost = ResType<Post>;
