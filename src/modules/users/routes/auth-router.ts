import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { ResType } from "common/types";
import { jwtService } from "common/services/jwt-service";
import { checkBearerAuth } from "middlewares";

import { ReqBodyAuth, User } from "../user";
import { authValidation } from "./validation";
import { usersService } from "../services/users-service";

export const authRouter = Router({});

authRouter.post(
  "/login",
  authValidation,
  async (req: Request<{}, {}, ReqBodyAuth>, res: Response<ResType>) => {
    const user = await usersService.authUser(req.body);

    if (user) {
      const result = await jwtService.createJWT(user);
      res.status(HTTP_STATUSES.OK_200).send(result);
    } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);

authRouter.get(
  "/me",
  checkBearerAuth,
  async (req: Request, res: Response<ResType>) => {
    const { id: userId, login, email } = req.requestContext.user as User;
    res.status(HTTP_STATUSES.OK_200).send({ userId, login, email });
  }
);
