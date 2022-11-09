import { FilterQuery } from "mongoose";

import { SessionModel } from "common/db";

import { RefreshSession } from "../auth";

export const sessionRepository = {
  async addSession(refreshSession: RefreshSession): Promise<boolean> {
    await SessionModel.insertMany(refreshSession);

    return true;
  },

  async getSession(
    filter: FilterQuery<RefreshSession>
  ): Promise<RefreshSession | null> {
    return await SessionModel.findOne(filter).lean();
  },

  async getSessions(
    filter: FilterQuery<RefreshSession>
  ): Promise<RefreshSession[]> {
    return await SessionModel.find(filter, { _id: false, __v: false }).lean();
  },

  async getCountSessions(filter: FilterQuery<RefreshSession>): Promise<number> {
    return await SessionModel.countDocuments(filter);
  },

  async removeOneWhere(filter: FilterQuery<RefreshSession>): Promise<boolean> {
    const result = await SessionModel.deleteOne(filter);

    return result.deletedCount === 1;
  },

  async removeAllWhere(filter: FilterQuery<RefreshSession>): Promise<boolean> {
    const result = await SessionModel.deleteMany(filter);

    return result.deletedCount >= 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await SessionModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
