import { FilterQuery } from "mongoose";

import { UserModel } from "common/db";
import { getPagesCount, getSkipCount } from "common/helpers/pagination";

import { User, UserDB, ReqQueryUser, ResUsers } from "../user";

const projection = {
  _id: false,
  __v: false,
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
    const filter: FilterQuery<UserDB> = {
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

    const totalCount = await UserModel.countDocuments(filter);

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = await UserModel.find(filter, { ...projection })
      .sort({ [`accountData.${sortBy}`]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .lean();

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: items.map(userMapper),
    };
  },

  async findUserById(id: string): Promise<User | null> {
    const user = await UserModel.findOne(
      { "accountData.id": id },
      { ...projection }
    ).lean();

    return user ? userMapper(user) : null;
  },

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserDB | null> {
    return await UserModel.findOne(
      {
        $or: [
          { "accountData.email": loginOrEmail },
          { "accountData.login": loginOrEmail },
        ],
      },
      { _id: false, __v: false }
    ).lean();
  },

  async findUserByLoginAndEmail(
    login: string,
    email: string
  ): Promise<User | null> {
    const user = await UserModel.findOne(
      { $or: [{ "accountData.email": email }, { "accountData.login": login }] },
      { _id: false, __v: false, passHash: false, passSalt: false }
    ).lean();

    return user ? userMapper(user) : null;
  },

  async findUserByConfirmationCode(code: string): Promise<UserDB | null> {
    return await UserModel.findOne(
      { "emailConfirmation.confirmationCode": code },
      { ...projection }
    ).lean();
  },
};
