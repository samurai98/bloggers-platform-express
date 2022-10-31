import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { ResType } from "common/types";
import { jwtService } from "common/services/jwt-service";
import { usersQueryRepository } from "modules/users/repositories";
import { checkBearerAuth } from "middlewares";

import { ReqBodyAuth, ReqBodyUser, User } from "../../users/user";
import { usersService } from "../../users/services/users-service";
import { authService } from "../services/auth-service";
import { ReqBodyConfirm, ReqBodyResending, ResLogin, ResMe } from "../auth";
import {
  authValidation,
  registrationValidation,
  confirmationValidation,
  resendingValidation,
} from "./validation";

export const authRouter = Router({});

authRouter.post(
  "/login",
  authValidation,
  async (req: Request<{}, {}, ReqBodyAuth>, res: Response<ResLogin>) => {
    const user = await authService.authUser(req.body);

    if (user) {
      const result = await jwtService.createJWT(user);
      res.status(HTTP_STATUSES.OK_200).send(result);
    } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);

authRouter.post(
  "/registration",
  registrationValidation,
  async (req: Request<{}, {}, ReqBodyUser>, res: Response<ResType>) => {
    const user = await usersService.createUser(req.body);

    if (user) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

authRouter.post(
  "/registration-confirmation",
  confirmationValidation,
  async (req: Request<{}, {}, ReqBodyConfirm>, res: Response<ResType>) => {
    const result = await authService.confirmEmail(req.body.code);

    if (result) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

authRouter.post(
  "/registration-email-resending",
  resendingValidation,
  async (req: Request<{}, {}, ReqBodyResending>, res: Response<ResType>) => {
    const user = await usersQueryRepository.findUserByLoginOrEmail(
      req.body.email
    );

    if (!user || user.emailConfirmation.isConfirmed) {
      res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      return;
    }

    const updatedUser = await authService.updateEmailConfirmation(user);
    const isSend =
      updatedUser && (await authService.sendConfirmEmail(updatedUser));

    if (isSend) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

authRouter.get(
  "/me",
  checkBearerAuth,
  async (req: Request, res: Response<ResMe>) => {
    const { id: userId, login, email } = req.requestContext.user as User;
    res.status(HTTP_STATUSES.OK_200).send({ userId, login, email });
  }
);
