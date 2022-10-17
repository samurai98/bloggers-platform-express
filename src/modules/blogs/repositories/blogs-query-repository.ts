import { Filter } from "mongodb";

import { blogsCollection } from "../../../common/db";
import {
  getPagesCount,
  getSkipCount,
  getSortDirectionNumber,
} from "../../../common/helpers/pagination";
import { Blog, ReqQueryBlog, ResBlogs } from "../blog";

export const blogsQueryRepository = {
  async getBlogs(query: ReqQueryBlog = {}): Promise<ResBlogs> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const sortBy = query.sortBy || "createdAt";
    const sortDirection = getSortDirectionNumber(query.sortDirection || "desc");
    const searchNameTerm = query.searchNameTerm || "";

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
