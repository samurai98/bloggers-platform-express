import { FilterQuery } from "mongoose";

import { PostModel } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { Post, ReqQueryPost } from "../post";

export const postsQueryRepository = {
  async getPosts({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    blogId,
  }: ReqQueryPost) {
    const filter: FilterQuery<Post> = blogId ? { blogId } : {};
    const totalCount = await PostModel.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await PostModel.find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean()) as Post[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findPostById(id: string) {
    return await PostModel.findOne({ id }, { _id: false, __v: false }).lean();
  },
};
