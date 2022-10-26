import { Request, Response, NextFunction } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { jwtService } from "common/services/jwt-service";
import { usersQueryRepository } from "modules/users/repositories";
import { User } from "modules/users/user";

export const checkBearerAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  const token = req.headers.authorization.split(" ")[1];
  const userId = await jwtService.getUserIdByToken(token);

  if (!userId) {
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return;
  }

  req.requestContext.user = await usersQueryRepository.findUserById(userId) as User;
  next();
};
