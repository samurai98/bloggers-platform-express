import { AnyKeys, AnyObject } from 'mongoose';
import { UserModel } from '../../../common/db';

import { UserDB } from '../user';

export const usersCommandRepository = {
  async createUser(user: UserDB): Promise<UserDB> {
    await UserModel.insertMany(user);

    return user;
  },

  async updateUser(id: string, user: AnyKeys<UserDB> & AnyObject): Promise<boolean> {
    const result = await UserModel.updateOne({ 'accountData.id': id }, { $set: user });

    return result.modifiedCount === 1;
  },

  async updateUserUnset(id: string, user: AnyKeys<UserDB> & AnyObject): Promise<boolean> {
    const result = await UserModel.updateOne({ 'accountData.id': id }, { $unset: user });

    return result.modifiedCount === 1;
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ 'accountData.id': id });
    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await UserModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
