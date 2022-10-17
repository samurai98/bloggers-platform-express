import { Pagination, Query, ResType } from "../../common/types";

export type Blog = {
  id: string;
  name: string;
  youtubeUrl: string;
  createdAt: string;
};

export type ReqBodyBlog = {
  name: string;
  youtubeUrl: string;
};

export type ReqBodyPostByBlogId = {
  title: string;
  shortDescription: string;
  content: string;
};

export type ParamBlog = { id: Blog["id"] };

export type ReqQueryBlog = Query & { searchNameTerm?: string };

export type ResBlogs = ResType<Pagination<Blog>>;

export type ResBlog = ResType<Blog>;
