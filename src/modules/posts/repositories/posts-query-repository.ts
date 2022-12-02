import { FilterQuery } from 'mongoose';

import { PostModel } from '../../../common/db';
import { QueryDBFilter } from '../../../common/types/common';

import { PostDB } from '../post';

export const postsQueryRepository = {
  async findPosts(
    filter: FilterQuery<PostDB>,
    { sortBy, sortDirection, skipCount, pageSize }: QueryDBFilter
  ): Promise<PostDB[]> {
    const items = await PostModel.find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return items;
  },

  async findPostsWhere(filter: FilterQuery<PostDB>): Promise<PostDB[]> {
    return await PostModel.find(filter, { _id: false, __v: false }).lean();
  },

  async countTotalPosts(filter: FilterQuery<PostDB>): Promise<number> {
    return await PostModel.countDocuments(filter);
  },

  async findPostById(id: string) {
    return await PostModel.findOne({ id }, { _id: false, __v: false }).lean();
  },
};
