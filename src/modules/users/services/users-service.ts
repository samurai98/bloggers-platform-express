import bcrypt from "bcrypt";
import { v4 as uuIdv4 } from "uuid";
import { add } from "date-fns";

import { getCurrentDateISO } from "common/helpers/utils";

import { usersRepository, usersQueryRepository } from "../repositories";
import {
  User,
  ReqBodyUser,
  UserDB,
  ReqBodyAuth,
  UserEmailConfirmation,
} from "../user";
import { emailsManager } from "modules/auth/managers/emails-manager";
import { authService } from "modules/auth/services/auth-service";

export const usersService = {
  async authUser({
    login: loginOrEmail,
    password,
  }: ReqBodyAuth): Promise<UserDB | false> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail
    );

    if (!user || !user.emailConfirmation.isConfirmed) return false;

    const passHash = await this._generateHash(
      password,
      user.accountData.passSalt
    );

    if (user.accountData.passHash !== passHash) return false;

    return user;
  },

  async createUser({
    email,
    login,
    password,
  }: ReqBodyUser): Promise<User | null> {
    const currentDate = getCurrentDateISO();
    const passSalt = await bcrypt.genSalt(10);
    const passHash = await this._generateHash(password, passSalt);

    const newUser: UserDB = {
      accountData: {
        id: currentDate,
        email,
        login,
        passHash,
        passSalt,
        createdAt: currentDate,
      },
      emailConfirmation: {
        confirmationCode: uuIdv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      },
    };

    const isSend = await authService.sendConfirmEmail(newUser);

    if (isSend) return usersRepository.createUser(newUser);

    return null;
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

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  },
};
