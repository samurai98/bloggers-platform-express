import { FilterQuery } from 'mongoose';

import { SessionModel } from '../../../common/db';

import { RefreshSessionDB } from '../auth';

export const sessionsQueryRepository = {
  async findSessions(filter: FilterQuery<RefreshSessionDB>): Promise<RefreshSessionDB[]> {
    return await SessionModel.find(filter, { _id: false, __v: false }).lean();
  },

  async findSession(filter: FilterQuery<RefreshSessionDB>): Promise<RefreshSessionDB | null> {
    return await SessionModel.findOne(filter).lean();
  },

  async countTotalSessions(filter: FilterQuery<RefreshSessionDB>): Promise<number> {
    return await SessionModel.countDocuments(filter);
  },
};
