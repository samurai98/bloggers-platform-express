import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { generateHash } from '../../../common/helpers/utils';
import { jwtService } from '../../../common/services/jwt-service';
import { SETTINGS } from '../../../settings/config';
import { UserDB, UserEmailConfirmation, PasswordRecovery } from '../../users/user';
import { usersService } from '../../users/services/users-service';
import { usersQueryRepository, usersRepository } from '../../users/repositories';

import { emailsManager } from '../../../common/emails/emails-manager';
import { LoginUserData, RefreshSession, ResLoginWithCookie } from '../auth';
import { sessionsService } from './sessions-service';

//@ts-ignore | Need that not send message on tests mails
import { validUsers } from '../../../../tests/common/data';

const accessTokenLifeTime = `${SETTINGS.ACCESS_TOKEN_LIFE_TIME_SECONDS}s`;
const refreshTokenLifeTime: Duration = { hours: Number(SETTINGS.REFRESH_TOKEN_LIFE_TIME_HOURS) };
const refreshTokenLifeTimeString = `${SETTINGS.REFRESH_TOKEN_LIFE_TIME_HOURS}h`;
const confirmEmailCodeLifeTime: Duration = { hours: 1 };
const recoveryCodeLifeTime: Duration = { hours: 1 };

export const authService = {
  async loginUser({ loginOrEmail, password, ip, ua }: LoginUserData): Promise<ResLoginWithCookie | false> {
    const user = await this._getUserByCredentials(loginOrEmail, password);

    if (!user) return false;

    return this._createNewRefreshSession({ userId: user.accountData.id, ip, ua });
  },

  async updateRefreshToken({
    refreshToken,
    ip,
    ua,
  }: {
    refreshToken: string;
    ip: string;
    ua?: string;
  }): Promise<ResLoginWithCookie | false> {
    if (!refreshToken) return false;

    const oldRefreshSession = await sessionsService.getByRefreshToken(refreshToken);
    const isVerify = !!oldRefreshSession && (await sessionsService.verifyRefreshSession(oldRefreshSession, ip));

    await sessionsService.deleteSession(refreshToken);

    if (!oldRefreshSession || !isVerify) return false;

    return await this._createNewRefreshSession({
      userId: oldRefreshSession.userId,
      currentDeviceId: oldRefreshSession.deviceId,
      ip,
      ua,
    });
  },

  async sendConfirmEmail(user: UserDB): Promise<boolean> {
    const testingEmails = validUsers.map(user => user.email);

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
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), confirmEmailCodeLifeTime),
    };

    const isUpdated = usersRepository.updateEmailConfirmationData(user.accountData.id, newConfirmationData);

    if (!isUpdated) return null;

    return usersQueryRepository.findUserByLoginOrEmail(user.accountData.email);
  },

  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken) return false;

    return await sessionsService.deleteSession(refreshToken);
  },

  async passwordRecovery(email: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(email);

    if (!user) return false;

    const recoveryData: PasswordRecovery = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), recoveryCodeLifeTime),
    };

    const isUpdated = await usersRepository.updatePasswordRecoveryData(user.accountData.id, recoveryData);

    if (!isUpdated) return false;

    const testingEmails = validUsers.map(user => user.email);
    if (testingEmails.includes(user.accountData.email)) return true;

    try {
      await emailsManager.sendEmailPasswordRecovery({ ...user, passwordRecovery: recoveryData });
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  },

  async setNewPassword(recoveryCode: string, newPassword: string): Promise<boolean> {
    const user = await usersQueryRepository.findUserByRecoveryCode(recoveryCode);

    if (!user || user.passwordRecovery!.expirationDate < new Date()) return false;

    const isUpdated = await usersService.updateUserPassword(user.accountData.id, newPassword);

    isUpdated && (await usersRepository.updatePasswordRecoveryData(user.accountData.id, undefined));

    return isUpdated;
  },

  async _getUserByCredentials(loginOrEmail: string, password: string): Promise<UserDB | null> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(loginOrEmail);
    const isCorrectPass =
      !!user && (await this._checkPass(password, user.accountData.passSalt, user.accountData.passHash));

    if (isCorrectPass) return user;

    return null;
  },

  async _checkPass(pass: string, passSalt: string, hash: string): Promise<boolean> {
    return (await generateHash(pass, passSalt)) === hash;
  },

  async _createNewRefreshSession({
    userId,
    ip,
    currentDeviceId,
    ua,
  }: {
    userId: string;
    ip: string;
    currentDeviceId?: string;
    ua?: string;
  }): Promise<ResLoginWithCookie> {
    const refreshTokenExpiresInMs = add(new Date(), refreshTokenLifeTime).getTime();
    const refreshTokenExpiresInSeconds = Math.floor(refreshTokenExpiresInMs / 1000);

    const deviceId = currentDeviceId || uuidv4();
    const refreshToken = await jwtService.createJWT({ userId, deviceId }, refreshTokenLifeTimeString);

    const newRefreshSession: RefreshSession = {
      ip,
      userId,
      issuedAt: new Date().getTime(),
      expiresIn: refreshTokenExpiresInMs,
      deviceId,
      deviceName: ua || 'User-Agent not defined',
      refreshToken,
    };

    await sessionsService.addRefreshSession(newRefreshSession);

    const accessToken = await jwtService.createJWT({ userId }, accessTokenLifeTime);

    return {
      accessToken,
      cookie: {
        name: 'refreshToken',
        value: newRefreshSession.refreshToken,
        options: {
          maxAge: refreshTokenExpiresInSeconds,
          httpOnly: true,
          // TODO: use cookie-parser middleware for use signed cookies
          // signed: true,
          secure: SETTINGS.IS_RUN_TEST || !SETTINGS.IS_LOCAL_VERSION,
          sameSite: true,
        },
      },
    };
  },
};
