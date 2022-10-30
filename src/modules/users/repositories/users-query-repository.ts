import { Filter } from "mongodb";

import { usersCollection } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { User, UserDB, ReqQueryUser, ResUsers } from "../user";

const projection = {
  _id: false,
  "accountData.passHash": false,
  "accountData.passSalt": false,
};

const userMapper = (userDB: UserDB): User => {
  const { id, email, login, createdAt } = userDB.accountData;

  return { id, email, login, createdAt };
};

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
        {
          "accountData.email": {
            $regex: new RegExp(`${searchEmailTerm}`, "i"),
          },
        },
        {
          "accountData.login": {
            $regex: new RegExp(`${searchLoginTerm}`, "i"),
          },
        },
      ],
    };

    const totalCount = await usersCollection.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = await usersCollection
      .find(filter, { projection })
      .sort({ [`accountData.${sortBy}`]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map(userMapper),
    };
  },

  async findUserById(id: string): Promise<User | null> {
    const user = await usersCollection.findOne(
      { "accountData.id": id },
      { projection }
    );

    return user ? userMapper(user) : null;
  },

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDB | null> {
    return usersCollection.findOne(
      {
        $or: [
          { "accountData.email": loginOrEmail },
          { "accountData.login": loginOrEmail },
        ],
      },
      { projection: { _id: false } }
    );
  },

  async findUserByLoginAndEmail(
    login: string,
    email: string
  ): Promise<User | null> {
    const user = await usersCollection.findOne(
      { $or: [{ "accountData.email": email }, { "accountData.login": login }] },
      { projection: { _id: false, passHash: false, passSalt: false } }
    );

    return user ? userMapper(user) : null;
  },

  async findUserByConfirmationCode(code: string): Promise<UserDB | null> {
    return await usersCollection.findOne(
      { "emailConfirmation.confirmationCode": code },
      { projection }
    );
  }
};
