import { Pagination, Query, ResType } from "../../common/types";

export type Post = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type ParamPost = { id: Post["id"] };

export type QueryPost = Query & { blogId?: string };

export type CreatePost = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type ResponsePosts = ResType<Pagination<Post>>;

export type ResponsePost = ResType<Post>;
