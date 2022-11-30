import { RefreshSessionDB, Device } from '../auth';

export const sessionToDeviceMapper = (session: RefreshSessionDB): Device => {
  const { ip, deviceId, deviceName, issuedAt } = session;

  return { ip, deviceId, title: deviceName, lastActiveDate: new Date(issuedAt).toISOString() };
};
