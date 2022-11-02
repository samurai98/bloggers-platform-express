import { sessionRepository } from "../repositories/session-repository";
import { RefreshSession } from "../auth";

const MAX_REFRESH_SESSIONS_COUNT = 5;

export const sessionsService = {
  async getByRefreshToken(token: string): Promise<RefreshSession | null> {
    return await sessionRepository.getSession({ refreshToken: token });
  },

  async addRefreshSession(refreshSession: RefreshSession): Promise<boolean> {
    if (!(await this._isValidSessionsCount(refreshSession.userId))) {
      await this._deleteAllUserRefreshSessions(refreshSession.userId);
    }

    await sessionRepository.addSession(refreshSession);

    return true;
  },

  async deleteSession(token: string): Promise<boolean> {
    return await sessionRepository.removeOneWhere({ refreshToken: token });
  },

  async verifyRefreshSession(
    oldSession: RefreshSession,
    newIp: string
  ): Promise<boolean> {
    const nowTime = new Date().getTime();

    if (nowTime > oldSession.expiresIn) return false;
    if (newIp !== oldSession.ip) return false;
    // TODO: implement fingerprint checking, instead of IP check
    //if (newFingerprint !== oldSession.fingerprint) return false;

    return true;
  },

  async _isValidSessionsCount(userId: string) {
    const existingSessionsCount = await sessionRepository.getCountSessions({
      userId,
    });

    return existingSessionsCount < MAX_REFRESH_SESSIONS_COUNT;
  },

  async _deleteAllUserRefreshSessions(userId: string) {
    return await sessionRepository.removeAllWhere({ userId });
  },
};
