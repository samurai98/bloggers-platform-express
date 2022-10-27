import { Filter } from "mongodb";

import { commentsCollection } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { Comment, CommentDB, ReqQueryComment, ResComments } from "../comment";

export const commentsQueryRepository = {
  async getComments({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    postId,
  }: ReqQueryComment): Promise<ResComments> {
    const filter: Filter<CommentDB> = postId ? { postId } : {};
    const totalCount = await commentsCollection.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await commentsCollection
      .find(filter, { projection: { _id: false, postId: false } })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray()) as Comment[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findCommentById(id: string): Promise<Comment | null> {
    return commentsCollection.findOne({ id }, { projection: { _id: false, postId: false } });
  },
};
