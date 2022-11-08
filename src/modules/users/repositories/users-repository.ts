import { usersCollection } from "common/db";

import { User, UserDB, UserEmailConfirmation } from "../user";

export const usersRepository = {
  async createUser(user: UserDB): Promise<User> {
    await usersCollection.insertOne(user);

    const { passHash, passSalt, ...clearUser } = user.accountData;
    return clearUser;
  },

  async deleteUser(id: string): Promise<boolean> {
    const result = await usersCollection.deleteOne({ "accountData.id": id });

    return result.deletedCount === 1;
  },

  async confirmEmail(id: string): Promise<boolean> {
    const result = await usersCollection.updateOne(
      { "accountData.id": id },
      { $set: { "emailConfirmation.isConfirmed": true } }
    );

    return result.modifiedCount === 1;
  },

  async updateEmailConfirmationData(
    id: string,
    { expirationDate, confirmationCode }: Partial<UserEmailConfirmation>
  ): Promise<boolean> {
    const result = await usersCollection.updateOne(
      { "accountData.id": id },
      {
        $set: {
          "emailConfirmation.expirationDate": expirationDate,
          "emailConfirmation.confirmationCode": confirmationCode,
        },
      }
    );

    return result.modifiedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await usersCollection.deleteMany({});

    return result.deletedCount >= 1;
  },
};
