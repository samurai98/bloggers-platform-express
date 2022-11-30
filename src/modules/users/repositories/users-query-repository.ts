import { FilterQuery } from 'mongoose';

import { UserModel } from '../../../common/db';
import { QueryDBFilter } from '../../../common/types/common';

import { UserDB } from '../user';

const projection = { _id: false, __v: false, 'accountData.passHash': false, 'accountData.passSalt': false };

export const usersQueryRepository = {
  async findUsers(
    filter: FilterQuery<UserDB>,
    { sortBy, sortDirection, skipCount, pageSize }: QueryDBFilter
  ): Promise<UserDB[]> {
    const items = await UserModel.find(filter, projection)
      .sort({ [`accountData.${sortBy}`]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return items;
  },

  async countTotalUsers(filter: FilterQuery<UserDB>): Promise<number> {
    return await UserModel.countDocuments(filter);
  },

  async findUser(filter: FilterQuery<UserDB>, clearPass = true): Promise<UserDB | null> {
    const proj = clearPass ? projection : { _id: false, __v: false };

    return await UserModel.findOne(filter, proj).lean();
  },
};
