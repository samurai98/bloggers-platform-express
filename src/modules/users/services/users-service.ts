import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

import { generateHash, getCurrentDateISO } from '../../../common/helpers/utils';
import { SETTINGS } from '../../../settings/config';
import { authService } from '../../auth/services/auth-service';

import { usersRepository } from '../repositories';
import { User, ReqBodyUser, UserDB } from '../user';

export const usersService = {
  async createUser({ email, login, password }: ReqBodyUser): Promise<User | null> {
    const currentDate = getCurrentDateISO();
    const passSalt = await bcrypt.genSalt(Number(SETTINGS.ROUNDS_SALT_COUNT));
    const passHash = await generateHash(password, passSalt);

    const newUser: UserDB = {
      accountData: { id: currentDate, email, login, passHash, passSalt, createdAt: currentDate },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      },
    };

    const isSend = await authService.sendConfirmEmail(newUser);

    if (isSend) return await usersRepository.createUser(newUser);

    return null;
  },

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const passSalt = await bcrypt.genSalt(Number(SETTINGS.ROUNDS_SALT_COUNT));
    const passHash = await generateHash(newPassword, passSalt);

    return await usersRepository.updatePassword(id, { passHash, passSalt });
  },

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.deleteUser(id);
  },
};
