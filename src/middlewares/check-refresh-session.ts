import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUSES } from '../common/http-statuses';
import { sessionsService } from '../modules/auth/services/sessions-service';
import { usersQueryRepository } from '../modules/users/repositories';
import { User } from '../modules/users/user';
import { jwtService } from '../common/services/jwt-service';

export const checkRefreshSession = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await sessionsService.getByRefreshToken(refreshToken);
  const isVerify = !!currentSession && (await sessionsService.verifyRefreshSession(currentSession, currentSession.ip));

  if (!isVerify) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  next();
};

export const setUserToContextBySession = async (req: Request, res: Response, next: NextFunction) => {
  /** TODO: temporarily, only for external tests */
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token ? await jwtService.getUserIdByToken(token) : null;

  if (userId && req.requestContext.user?.id !== userId)
    req.requestContext.user = (await usersQueryRepository.findUserById(userId)) as User;
  /**************/

  const refreshToken = req.cookies?.refreshToken;
  const currentSession = await sessionsService.getByRefreshToken(refreshToken);

  if (currentSession && req.requestContext.user?.id !== currentSession.userId)
    req.requestContext.user = (await usersQueryRepository.findUserById(currentSession.userId)) as User;

  next();
};
