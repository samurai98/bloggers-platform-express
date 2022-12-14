import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUSES } from '../common/http-statuses';
import { sessionsService } from '../modules/auth/services';

export const checkRefreshSession = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.signedCookies?.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await sessionsService.getSessionByRefreshToken(refreshToken);
  const isVerify = !!currentSession && (await sessionsService.verifyRefreshSession(currentSession, currentSession.ip));

  if (!isVerify) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  next();
};
