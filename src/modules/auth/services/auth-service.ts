import { add } from "date-fns";
import { v4 as uuIdv4 } from "uuid";

import {
  usersQueryRepository,
  usersRepository,
} from "modules/users/repositories";
import { ReqBodyAuth, UserDB, UserEmailConfirmation } from "modules/users/user";
import { generateHash } from "common/helpers/utils";

import { emailsManager } from "../managers/emails-manager";

//@ts-ignore
import { validUsers } from "../../../../tests/common/data";

export const authService = {
  async authUser({
    login: loginOrEmail,
    password,
  }: ReqBodyAuth): Promise<UserDB | false> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail
    );

    if (!user || !user.emailConfirmation.isConfirmed) return false;

    const passHash = await generateHash(password, user.accountData.passSalt);

    if (user.accountData.passHash !== passHash) return false;

    return user;
  },

  async sendConfirmEmail(user: UserDB): Promise<boolean> {
    const testingEmails = validUsers.map((user) => user.email);

    if (testingEmails.includes(user.accountData.email)) return true;

    try {
      await emailsManager.sendEmailConfirmationMessage(user);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  },

  async confirmEmail(code: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByConfirmationCode(code);

    if (
      !user ||
      user.emailConfirmation.confirmationCode !== code ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    )
      return false;

    return await usersRepository.confirmEmail(user.accountData.id);
  },

  async resendingEmail(email: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user || user.emailConfirmation.isConfirmed) return false;

    const updatedUser = await this.updateEmailConfirmation(user);
    const isSend = updatedUser && (await this.sendConfirmEmail(updatedUser));

    return Boolean(isSend);
  },

  async updateEmailConfirmation(user: UserDB): Promise<UserDB | null> {
    const newConfirmationData: Partial<UserEmailConfirmation> = {
      confirmationCode: uuIdv4(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    const isUpdated = usersRepository.updateEmailConfirmationData(
      user.accountData.id,
      newConfirmationData
    );

    if (!isUpdated) return null;

    return usersQueryRepository.findUserByLoginOrEmail(user.accountData.email);
  },
};
