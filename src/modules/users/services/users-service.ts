import bcrypt from 'bcrypt';
import { FilterQuery } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

import { generateHash, getCurrentDateISO } from '../../../common/helpers/utils';
import { SETTINGS } from '../../../settings/config';
import { emailsService, sessionsService } from '../../auth/services';
import { Pagination } from '../../../common/types/common';
import { getPagesCount, getSkipCount } from '../../../common/helpers/pagination';

import { usersCommandRepository, usersQueryRepository } from '../repositories';
import { User, UserDB, ReqBodyUser, ReqQueryUser, UserEmailConfirmation, PasswordRecovery } from '../user';
import { userMapper } from './users-mapper';

export const usersService = {
  async getUsers({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchEmailTerm,
    searchLoginTerm,
  }: ReqQueryUser): Promise<Pagination<User>> {
    const filter: FilterQuery<UserDB> = {
      $or: [
        { 'accountData.email': { $regex: new RegExp(`${searchEmailTerm}`, 'i') } },
        { 'accountData.login': { $regex: new RegExp(`${searchLoginTerm}`, 'i') } },
      ],
    };
    const totalCount = await usersQueryRepository.countTotalUsers(filter);
    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const usersDB = await usersQueryRepository.findUsers(filter, { sortBy, sortDirection, skipCount, pageSize });
    const users = usersDB.map(user => userMapper(user));

    return { pagesCount, page: pageNumber, pageSize, totalCount, items: users };
  },

  async getUserById(userId: string): Promise<User | null> {
    const user = await usersQueryRepository.findUser({ 'accountData.id': userId });

    return user && userMapper(user);
  },

  async createUser({ email, login, password }: ReqBodyUser): Promise<User | null> {
    const currentDate = getCurrentDateISO();
    const passSalt = await bcrypt.genSalt(Number(SETTINGS.ROUNDS_SALT_COUNT));
    const passHash = await generateHash(password, passSalt);
    const newUser: UserDB = {
      accountData: { id: uuidv4(), email, login, passHash, passSalt, createdAt: currentDate },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      },
    };

    const isSend = await emailsService.sendConfirmEmail(newUser);

    if (isSend) return userMapper(await usersCommandRepository.createUser(newUser));

    return null;
  },

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const passSalt = await bcrypt.genSalt(Number(SETTINGS.ROUNDS_SALT_COUNT));
    const passHash = await generateHash(newPassword, passSalt);
    const updateData = { 'accountData.passHash': passHash, 'accountData.passSalt': passSalt };

    return await usersCommandRepository.updateUser(id, updateData);
  },

  async deleteUser(id: string): Promise<boolean> {
    sessionsService.deleteAllUserRefreshSessions(id);

    return usersCommandRepository.deleteUser(id);
  },

  async getUserByConfirmationCode(code: string): Promise<UserDB | null> {
    return await usersQueryRepository.findUser({ 'emailConfirmation.confirmationCode': code });
  },

  async getUserByRecoveryCode(code: string): Promise<UserDB | null> {
    return await usersQueryRepository.findUser({ 'passwordRecovery.recoveryCode': code });
  },

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDB | null> {
    return await usersQueryRepository.findUser(
      { $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] },
      false
    );
  },

  async getUserByLoginAndEmail(login: string, email: string): Promise<User | null> {
    const user = await usersQueryRepository.findUser({
      $or: [{ 'accountData.email': email }, { 'accountData.login': login }],
    });

    return user ? userMapper(user) : null;
  },

  async confirmEmail(id: string): Promise<boolean> {
    const updateData = { 'emailConfirmation.isConfirmed': true };

    return await usersCommandRepository.updateUser(id, updateData);
  },

  async updateEmailConfirmationData(
    id: string,
    { expirationDate, confirmationCode }: Partial<UserEmailConfirmation>
  ): Promise<boolean> {
    const updateData = {
      'emailConfirmation.expirationDate': expirationDate,
      'emailConfirmation.confirmationCode': confirmationCode,
    };

    return await usersCommandRepository.updateUser(id, updateData);
  },

  async updatePasswordRecoveryData(id: string, passwordRecovery: PasswordRecovery | undefined): Promise<boolean> {
    if (passwordRecovery)
      return await usersCommandRepository.updateUser(id, {
        'passwordRecovery.expirationDate': passwordRecovery.expirationDate,
        'passwordRecovery.recoveryCode': passwordRecovery.recoveryCode,
      });

    return await usersCommandRepository.updateUserUnset(id, { passwordRecovery: '' });
  },
};
