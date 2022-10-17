import { Filter } from "mongodb";

import { postsCollection } from "../../../common/db";
import {
  getPagesCount,
  getSkipCount,
  getSortDirectionNumber,
} from "../../../common/helpers/pagination";
import { Post, ReqQueryPost } from "../post";

export const postsQueryRepository = {
  async getPosts(query: ReqQueryPost = {}) {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const sortBy = query.sortBy || "createdAt";
    const sortDirection = getSortDirectionNumber(query.sortDirection || "desc");
    const blogId = query.blogId;

    const filter: Filter<Post> = blogId ? { blogId } : {};
    const totalCount = await postsCollection.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await postsCollection
      .find(filter, { projection: { _id: false } })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray()) as Post[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findPostById(id: string) {
    return postsCollection.findOne({ id }, { projection: { _id: false } });
  },
};
