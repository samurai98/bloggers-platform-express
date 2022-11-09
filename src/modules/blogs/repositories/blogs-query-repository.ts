import { FilterQuery } from "mongoose";

import { BlogModel } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { Blog, ReqQueryBlog, ResBlogs } from "../blog";

export const blogsQueryRepository = {
  async getBlogs({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: ReqQueryBlog): Promise<ResBlogs> {
    const filter: FilterQuery<Blog> = {
      name: { $regex: new RegExp(`${searchNameTerm}`, "i") },
    };
    const totalCount = await BlogModel.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = await BlogModel.find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findBlogById(id: string): Promise<Blog | null> {
    return await BlogModel.findOne({ id }, { _id: false, __v: false }).lean();
  },
};
