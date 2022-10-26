import { Filter } from "mongodb";

import { usersCollection } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { User, UserDB, ReqQueryUser, ResUsers } from "../user";

export const usersQueryRepository = {
  async getUsers({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchEmailTerm,
    searchLoginTerm,
  }: ReqQueryUser): Promise<ResUsers> {
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
      .find(filter, {
        projection: { _id: false, passHash: false, passSalt: false },
      })
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

  async findUserById(id: string): Promise<User | null> {
    return usersCollection.findOne(
      { id: id },
      { projection: { _id: false, passHash: false, passSalt: false } }
    );
  },

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDB | null> {
    return usersCollection.findOne(
      { $or: [{ email: loginOrEmail }, { login: loginOrEmail }] },
      { projection: { _id: false } }
    );
  },

  async findByLoginAndEmail(
    login: string,
    email: string
  ): Promise<User | null> {
    return usersCollection.findOne(
      { $or: [{ email }, { login }] },
      { projection: { _id: false, passHash: false, passSalt: false } }
    );
  },
};
