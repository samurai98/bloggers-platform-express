import { FilterQuery } from 'mongoose';

import { BlogModel } from '../../../common/db';
import { QueryDBFilter } from '../../../common/types/common';

import { BlogDB } from '../blog';

export const blogsQueryRepository = {
  async findBlogs(
    filter: FilterQuery<BlogDB>,
    { sortBy, sortDirection, skipCount, pageSize }: QueryDBFilter
  ): Promise<BlogDB[]> {
    const items = await BlogModel.find(filter, { _id: false, __v: false })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return items;
  },

  async countTotalBlogs(filter: FilterQuery<BlogDB>): Promise<number> {
    return await BlogModel.countDocuments(filter);
  },

  async findBlogById(id: string): Promise<BlogDB | null> {
    return await BlogModel.findOne({ id }, { _id: false, __v: false }).lean();
  },
};
