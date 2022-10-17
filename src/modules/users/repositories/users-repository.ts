import { usersCollection } from "../../../common/db";
import { User, UserDB, ReqBodyAuth } from "../user";

export const usersRepository = {
  async createUser(user: UserDB): Promise<User> {
    await usersCollection.insertOne({ ...user });

    const { passHash, passSalt, ...clearUser } = user;
    return clearUser;
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await usersCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await usersCollection.deleteMany({});

    return result.deletedCount === 1;
  },
};
