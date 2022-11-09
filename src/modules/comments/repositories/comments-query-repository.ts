import { FilterQuery } from "mongoose";

import { CommentModel } from "common/db";
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
    const filter: FilterQuery<CommentDB> = postId ? { postId } : {};
    const totalCount = await CommentModel.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await CommentModel.find(filter, {
      _id: false,
      __v: false,
      postId: false,
    })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean()) as Comment[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findCommentById(id: string): Promise<Comment | null> {
    return await CommentModel.findOne(
      { id },
      { _id: false, __v: false, postId: false }
    ).lean();
  },
};
