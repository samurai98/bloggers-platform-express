import { FilterQuery } from 'mongoose';

import { CommentModel } from '../../../common/db';
import { QueryDBFilter } from '../../../common/types/common';

import { CommentDB } from '../comment';

export const commentsQueryRepository = {
  async findComments(
    filter: FilterQuery<CommentDB>,
    { sortBy, sortDirection, skipCount, pageSize }: QueryDBFilter
  ): Promise<CommentDB[]> {
    const items = await CommentModel.find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return items;
  },

  async countTotalComments(filter: FilterQuery<CommentDB>): Promise<number> {
    return await CommentModel.countDocuments(filter);
  },

  async findCommentById(id: string): Promise<CommentDB | null> {
    return await CommentModel.findOne({ id }, { _id: false, __v: false }).lean();
  },
};
