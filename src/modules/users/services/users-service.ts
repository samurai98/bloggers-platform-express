import bcrypt from "bcrypt";
import { v4 as uuIdv4 } from "uuid";
import { add } from "date-fns";

import { generateHash, getCurrentDateISO } from "common/helpers/utils";

import { usersRepository } from "../repositories";
import { User, ReqBodyUser, UserDB } from "../user";
import { authService } from "modules/auth/services/auth-service";

export const usersService = {
  async createUser({
    email,
    login,
    password,
  }: ReqBodyUser): Promise<User | null> {
    const currentDate = getCurrentDateISO();
    const passSalt = await bcrypt.genSalt(10);
    const passHash = await generateHash(password, passSalt);

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

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },
};
