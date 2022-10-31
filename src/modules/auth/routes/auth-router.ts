import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { ResErrorsMessages, ResType } from "common/types";
import { jwtService } from "common/services/jwt-service";
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
import { getErrorsMessages } from "common/helpers/utils";

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
  async (
    req: Request<{}, {}, ReqBodyConfirm>,
    res: Response<ResErrorsMessages>
  ) => {
    const result = await authService.confirmEmail(req.body.code);

    if (result) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else
      res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send(
          getErrorsMessages<ReqBodyConfirm>({ code: "Incorrect confirm code" })
        );
  }
);

authRouter.post(
  "/registration-email-resending",
  resendingValidation,
  async (
    req: Request<{}, {}, ReqBodyResending>,
    res: Response<ResErrorsMessages>
  ) => {
    const isResending = await authService.resendingEmail(req.body.email);

    if (isResending) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else
      res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send(
          getErrorsMessages<ReqBodyResending>({ email: "Incorrect email" })
        );
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
