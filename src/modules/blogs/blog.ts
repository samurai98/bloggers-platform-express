import { Pagination, Query, ResType } from "../../common/types";

export type Blog = {
  id: string;
  name: string;
  youtubeUrl: string;
  createdAt: string;
};

export type ParamBlog = { id: Blog["id"] };

export type QueryBlog = Query & {
  searchNameTerm?: string;
};

export type CreateBlog = {
  name: string;
  youtubeUrl: string;
};

export type ResponseBlogs = ResType<Pagination<Blog>>;

export type ResponseBlog = ResType<Blog>;
