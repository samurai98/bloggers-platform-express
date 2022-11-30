import { sessionsCommandRepository, sessionsQueryRepository } from '../repositories';
import { Device, RefreshSessionDB } from '../auth';
import { sessionToDeviceMapper } from './sessions-mapper';

const MAX_REFRESH_SESSIONS_COUNT = 5;

export const sessionsService = {
  async getSessionByRefreshToken(token: string): Promise<RefreshSessionDB | null> {
    return await sessionsQueryRepository.findSession({ refreshToken: token });
  },

  async getActiveSessions(userId: string | undefined): Promise<Device[] | null> {
    if (!userId) return null;

    const sessions = await sessionsQueryRepository.findSessions({ userId });

    return sessions.map(session => sessionToDeviceMapper(session));
  },

  async getSessionByDeviceId(deviceId: string): Promise<RefreshSessionDB | null> {
    return await sessionsQueryRepository.findSession({ deviceId });
  },

  async addRefreshSession(refreshSession: RefreshSessionDB): Promise<boolean> {
    if (!(await this._isValidSessionsCount(refreshSession.userId))) {
      await this._deleteAllUserRefreshSessions(refreshSession.userId);
    }

    await sessionsCommandRepository.createSession(refreshSession);

    return true;
  },

  async deleteSession(refreshToken: string): Promise<boolean> {
    return await sessionsCommandRepository.deleteOneWhere({ refreshToken });
  },

  async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    return await sessionsCommandRepository.deleteOneWhere({ deviceId });
  },

  async deleteAllSessionsExcludeCurrent(
    refreshToken: string | undefined,
    userId: string | undefined
  ): Promise<boolean> {
    if (!refreshToken || !userId) return false;

    return await sessionsCommandRepository.deleteAllWhere({
      $and: [{ userId }, { refreshToken: { $ne: refreshToken } }],
    });
  },

  async verifyRefreshSession(oldSession: RefreshSessionDB, newIp: string): Promise<boolean> {
    const nowTime = new Date().getTime();

    if (nowTime > oldSession.expiresIn) return false;
    if (newIp !== oldSession.ip) return false;
    // TODO: implement fingerprint checking, instead of IP check
    //if (newFingerprint !== oldSession.fingerprint) return false;

    return true;
  },

  async _isValidSessionsCount(userId: string): Promise<boolean> {
    const existingSessionsCount = await sessionsQueryRepository.countTotalSessions({ userId });

    return existingSessionsCount < MAX_REFRESH_SESSIONS_COUNT;
  },

  async _deleteAllUserRefreshSessions(userId: string): Promise<boolean> {
    return await sessionsCommandRepository.deleteAllWhere({ userId });
  },
};
