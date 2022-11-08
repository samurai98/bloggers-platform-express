import { sessionRepository } from "../repositories/session-repository";
import { Device, RefreshSession } from "../auth";

const MAX_REFRESH_SESSIONS_COUNT = 5;

export const sessionsService = {
  async getByRefreshToken(token: string): Promise<RefreshSession | null> {
    return await sessionRepository.getSession({ refreshToken: token });
  },

  async getActiveSessions(
    userId: string | undefined
  ): Promise<Device[] | false> {
    if (!userId) return false;

    const sessions = await sessionRepository.getSessions({ userId });

    return sessions.map((session) => ({
      ip: session.ip,
      deviceId: session.deviceId,
      title: session.deviceName,
      lastActiveDate: new Date(session.issuedAt).toISOString(),
    }));
  },

  async getSessionByDeviceId(deviceId: string): Promise<RefreshSession | null> {
    return await sessionRepository.getSession({ deviceId });
  },

  async addRefreshSession(refreshSession: RefreshSession): Promise<boolean> {
    if (!(await this._isValidSessionsCount(refreshSession.userId))) {
      await this._deleteAllUserRefreshSessions(refreshSession.userId);
    }

    await sessionRepository.addSession(refreshSession);

    return true;
  },

  async deleteSession(refreshToken: string): Promise<boolean> {
    return await sessionRepository.removeOneWhere({ refreshToken });
  },

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    return await sessionRepository.removeOneWhere({ deviceId });
  },

  async deleteAllSessionsExcludeCurrent(
    refreshToken: string | undefined,
    userId: string | undefined
  ): Promise<boolean> {
    if (!refreshToken || !userId) return false;

    return await sessionRepository.removeAllWhere({
      $and: [{ userId }, { refreshToken: { $ne: refreshToken } }],
    });
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
