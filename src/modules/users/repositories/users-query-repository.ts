import { Filter } from "mongodb";

import { usersCollection } from "../../../common/db";
import {
  getPagesCount,
  getSkipCount,
  getSortDirectionNumber,
} from "../../../common/helpers/pagination";
import { User, UserDB, ReqQueryUser, ResUsers } from "../user";

export const usersQueryRepository = {
  async getUsers(query: ReqQueryUser = {}): Promise<ResUsers> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const sortBy = query.sortBy || "createdAt";
    const sortDirection = getSortDirectionNumber(query.sortDirection || "desc");
    const searchEmailTerm = query.searchEmailTerm || "";
    const searchLoginTerm = query.searchLoginTerm || "";

    const filter: Filter<UserDB> = {
      $or: [
        { email: { $regex: new RegExp(`${searchEmailTerm}`, "i") } },
        { login: { $regex: new RegExp(`${searchLoginTerm}`, "i") } },
      ],
    };

    const totalCount = await usersCollection.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await usersCollection
      .find(filter, { projection: { _id: false, password: false } })
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray()) as User[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDB | null> {
    return usersCollection.findOne(
      { $or: [{ email: loginOrEmail }, { userName: loginOrEmail }] },
      { projection: { _id: false } }
    );
  },
};
