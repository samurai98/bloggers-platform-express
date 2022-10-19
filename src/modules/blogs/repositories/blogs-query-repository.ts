import { Filter } from "mongodb";

import { blogsCollection } from "../../../common/db";
import {
  getPagesCount,
  getSkipCount,
} from "../../../common/helpers/pagination";
import { Blog, ReqQueryBlog, ResBlogs } from "../blog";

export const blogsQueryRepository = {
  async getBlogs({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: ReqQueryBlog): Promise<ResBlogs> {
    const filter: Filter<Blog> = {
      name: { $regex: new RegExp(`${searchNameTerm}`, "i") },
    };
    const totalCount = await blogsCollection.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await blogsCollection
      .find(filter, { projection: { _id: false } })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray()) as Blog[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findBlogById(id: string): Promise<Blog | null> {
    return blogsCollection.findOne({ id }, { projection: { _id: false } });
  },
};
