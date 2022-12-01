import { Pagination, Query, ResType } from '../../common/types/common';

export type Blog = {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  createdAt: string;
};

export type BlogDB = Blog & { userId: string };

export type ReqBodyBlog = { name: string; websiteUrl: string; description: string };

export type ReqBodyPostByBlogId = { title: string; shortDescription: string; content: string };

export type ReqQueryBlog = Query & { searchNameTerm?: string };

export type ResBlogs = ResType<Pagination<Blog>>;

export type ResBlog = ResType<Blog>;
