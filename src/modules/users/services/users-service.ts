import bcrypt from "bcrypt";

import { usersRepository, usersQueryRepository } from "../repositories";
import { User, ReqBodyUser, UserDB, ReqBodyAuth } from "../user";

export const usersService = {
  async authUser({ loginOrEmail, password }: ReqBodyAuth): Promise<boolean> {
    const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) return false;

    const passHash = await this._generateHash(password, user.passSalt);

    if (user.passHash !== passHash) return false;

    return true;
  },

  async createUser({ email, login, password }: ReqBodyUser): Promise<User> {
    const currentDate = new Date().toISOString();
    const passSalt = await bcrypt.genSalt(10);
    const passHash = await this._generateHash(password, passSalt);

    const newUser: UserDB = {
      id: currentDate,
      email,
      login,
      passHash,
      passSalt,
      createdAt: currentDate,
    };

    return usersRepository.createUser(newUser);
  },

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },

  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  },
};
