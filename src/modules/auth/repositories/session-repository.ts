import { Filter } from "mongodb";

import { sessionsCollection } from "common/db";

import { RefreshSession } from "../auth";

export const sessionRepository = {
  async addSession(refreshSession: RefreshSession): Promise<boolean> {
    await sessionsCollection.insertOne(refreshSession);

    return true;
  },

  async getSession(
    filter: Filter<RefreshSession>
  ): Promise<RefreshSession | null> {
    return await sessionsCollection.findOne(filter);
  },

  async getSessions(filter: Filter<RefreshSession>): Promise<RefreshSession[]> {
    return await sessionsCollection
      .find(filter, { projection: { _id: false } })
      .toArray();
  },

  async getCountSessions(filter: Filter<RefreshSession>): Promise<number> {
    return await sessionsCollection.countDocuments(filter);
  },

  async removeOneWhere(filter: Filter<RefreshSession>): Promise<boolean> {
    const result = await sessionsCollection.deleteOne(filter);

    return result.deletedCount === 1;
  },

  async removeAllWhere(filter: Filter<RefreshSession>): Promise<boolean> {
    const result = await sessionsCollection.deleteMany(filter);

    return result.deletedCount >= 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await sessionsCollection.deleteMany({});

    return result.deletedCount >= 1;
  },
};
