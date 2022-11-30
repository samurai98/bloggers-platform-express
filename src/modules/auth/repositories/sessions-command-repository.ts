import { FilterQuery } from 'mongoose';

import { SessionModel } from '../../../common/db';

import { RefreshSessionDB } from '../auth';

export const sessionsCommandRepository = {
  async createSession(refreshSession: RefreshSessionDB): Promise<boolean> {
    await SessionModel.insertMany(refreshSession);

    return true;
  },

  async deleteOneWhere(filter: FilterQuery<RefreshSessionDB>): Promise<boolean> {
    const result = await SessionModel.deleteOne(filter);

    return result.deletedCount === 1;
  },

  async deleteAllWhere(filter: FilterQuery<RefreshSessionDB>): Promise<boolean> {
    const result = await SessionModel.deleteMany(filter);

    return result.deletedCount >= 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await SessionModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
