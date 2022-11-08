import { Request, Response, NextFunction } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { sessionsService } from "modules/auth/services/sessions-service";
import { usersQueryRepository } from "modules/users/repositories";
import { User } from "modules/users/user";

export const checkRefreshSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await sessionsService.getByRefreshToken(refreshToken);
  const isVerify =
    !!currentSession &&
    (await sessionsService.verifyRefreshSession(
      currentSession,
      currentSession.ip
    ));

  if (!isVerify) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  next();
};

/** TODO: temporarily, only for external tests */
export const setUserToRequestContextBySession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await sessionsService.getByRefreshToken(refreshToken);

  req.requestContext.user = (await usersQueryRepository.findUserById(
    currentSession!.userId
  )) as User;

  next();
};
