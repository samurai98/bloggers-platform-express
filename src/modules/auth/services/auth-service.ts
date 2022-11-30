import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { generateHash } from '../../../common/helpers/utils';
import { jwtService } from '../../../common/services/jwt-service';
import { SETTINGS } from '../../../settings/config';
import { UserDB, PasswordRecovery } from '../../users/user';
import { usersService } from '../../users/services/users-service';

import { LoginUserData, ResLoginWithCookie } from '../auth';
import { sessionsService, emailsService } from '.';

const accessTokenLifeTime = `${SETTINGS.ACCESS_TOKEN_LIFE_TIME_SECONDS}s`;
const refreshTokenLifeTime: Duration = { hours: Number(SETTINGS.REFRESH_TOKEN_LIFE_TIME_HOURS) };
const refreshTokenLifeTimeString = `${SETTINGS.REFRESH_TOKEN_LIFE_TIME_HOURS}h`;
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

    const oldRefreshSession = await sessionsService.getSessionByRefreshToken(refreshToken);
    const isVerify = !!oldRefreshSession && (await sessionsService.verifyRefreshSession(oldRefreshSession, ip));

    await sessionsService.deleteSession(refreshToken);

    if (!oldRefreshSession || !isVerify) return false;

    const { userId, deviceId } = oldRefreshSession;

    return await this._createNewRefreshSession({ userId, currentDeviceId: deviceId, ip, ua });
  },

  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken) return false;

    return await sessionsService.deleteSession(refreshToken);
  },

  async passwordRecovery(email: string): Promise<boolean> {
    const user = await usersService.getUserByLoginOrEmail(email);

    if (!user) return false;

    const recoveryData: PasswordRecovery = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), recoveryCodeLifeTime),
    };

    const isUpdated = await usersService.updatePasswordRecoveryData(user.accountData.id, recoveryData);

    if (!isUpdated) return false;

    return await emailsService.sendPasswordRecovery(user, recoveryData);
  },

  async setNewPassword(recoveryCode: string, newPassword: string): Promise<boolean> {
    const user = await usersService.getUserByRecoveryCode(recoveryCode);

    if (!user || user.passwordRecovery!.expirationDate < new Date()) return false;

    const isUpdated = await usersService.updateUserPassword(user.accountData.id, newPassword);

    isUpdated && (await usersService.updatePasswordRecoveryData(user.accountData.id, undefined));

    return isUpdated;
  },

  async _getUserByCredentials(loginOrEmail: string, password: string): Promise<UserDB | null> {
    const user = await usersService.getUserByLoginOrEmail(loginOrEmail);
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

    await sessionsService.addRefreshSession({
      ip,
      userId,
      issuedAt: new Date().getTime(),
      expiresIn: refreshTokenExpiresInMs,
      deviceId,
      deviceName: ua || 'User-Agent not defined',
      refreshToken,
    });

    const accessToken = await jwtService.createJWT({ userId }, accessTokenLifeTime);

    return {
      accessToken,
      cookie: {
        name: 'refreshToken',
        value: refreshToken,
        options: {
          path: '/auth',
          maxAge: refreshTokenExpiresInSeconds,
          httpOnly: true,
          signed: true,
          secure: SETTINGS.IS_RUN_TEST || !SETTINGS.IS_LOCAL_VERSION,
          sameSite: true,
        },
      },
    };
  },
};
