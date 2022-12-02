import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUSES } from '../common/http-statuses';
import { jwtService } from '../common/services/jwt-service';
import { usersService } from '../modules/users/services/users-service';

export const checkBearerAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  const tokenUserId = await jwtService.getUserIdByToken(token);
  const user = tokenUserId && (await usersService.getUserById(tokenUserId));

  if (!tokenUserId || !user) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  if (req.requestContext.user?.id !== tokenUserId) req.requestContext.user = user;

  next();
};

export const setUserToContextByAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  const tokenUserId = token ? await jwtService.getUserIdByToken(token) : null;
  const user = tokenUserId && (await usersService.getUserById(tokenUserId));

  if (user && req.requestContext.user?.id !== tokenUserId) req.requestContext.user = user;

  next();
};
