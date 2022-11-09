import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import {
  usersQueryRepository,
  usersRepository,
} from "modules/users/repositories";
import { UserDB, UserEmailConfirmation } from "modules/users/user";
import { generateHash } from "common/helpers/utils";
import { jwtService } from "common/services/jwt-service";
import { SETTINGS } from "settings/config";

import { emailsManager } from "../managers/emails-manager";
import { LoginUserData, RefreshSession, ResLoginWithCookie } from "../auth";

//@ts-ignore
import { validUsers } from "../../../../tests/common/data";
import { sessionsService } from "./sessions-service";

const accessTokenLifeTime = "10s";
const refreshTokenLifeTime: Duration = { seconds: 20 };
const refreshTokenLifeTimeString = "20s";
const confirmEmailCodeLifeTime: Duration = { hours: 1 };

export const authService = {
  async loginUser({
    login: loginOrEmail,
    password,
    ip,
    ua,
  }: LoginUserData): Promise<ResLoginWithCookie | false> {
    const user = await this._getUserByCredentials(loginOrEmail, password);

    if (!user) return false;

    return this._createNewRefreshSession({
      userId: user.accountData.id,
      ip,
      ua,
    });
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

    const oldRefreshSession = await sessionsService.getByRefreshToken(
      refreshToken
    );
    const isVerify =
      !!oldRefreshSession &&
      (await sessionsService.verifyRefreshSession(oldRefreshSession, ip));

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
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), confirmEmailCodeLifeTime),
    };

    const isUpdated = usersRepository.updateEmailConfirmationData(
      user.accountData.id,
      newConfirmationData
    );

    if (!isUpdated) return null;

    return usersQueryRepository.findUserByLoginOrEmail(user.accountData.email);
  },

  async logout(refreshToken: string): Promise<boolean> {
    if (!refreshToken) return false;

    return await sessionsService.deleteSession(refreshToken);
  },

  async _getUserByCredentials(
    loginOrEmail: string,
    password: string
  ): Promise<UserDB | null> {
    const user = await usersQueryRepository.findUserByLoginOrEmail(
      loginOrEmail
    );
    const isCorrectPass =
      !!user &&
      (await this._checkPass(
        password,
        user.accountData.passSalt,
        user.accountData.passHash
      ));

    if (isCorrectPass) return user;

    return null;
  },

  async _checkPass(
    pass: string,
    passSalt: string,
    hash: string
  ): Promise<boolean> {
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
    const refreshTokenExpiresInMs = add(
      new Date(),
      refreshTokenLifeTime
    ).getTime();
    const refreshTokenExpiresInSeconds = Math.floor(
      refreshTokenExpiresInMs / 1000
    );

    const deviceId = currentDeviceId || uuidv4();
    const refreshToken = await jwtService.createJWT(
      { userId, deviceId },
      refreshTokenLifeTimeString
    );

    const newRefreshSession: RefreshSession = {
      ip,
      userId,
      issuedAt: new Date().getTime(),
      expiresIn: refreshTokenExpiresInMs,
      deviceId,
      deviceName: ua || "User-Agent not defined",
      refreshToken,
    };

    await sessionsService.addRefreshSession(newRefreshSession);

    const accessToken = await jwtService.createJWT(
      { userId },
      accessTokenLifeTime
    );

    return {
      accessToken,
      cookie: {
        name: "refreshToken",
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
