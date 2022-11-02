import { Router, Request, Response } from "express";

import { checkBearerAuth } from "middlewares";
import { HTTP_STATUSES } from "common/http-statuses";
import { ResErrorsMessages, ResType } from "common/types";
import { getErrorsMessages } from "common/helpers/utils";

import { ReqBodyUser, User } from "../../users/user";
import { usersService } from "../../users/services/users-service";
import { authService } from "../services/auth-service";
import {
  ReqBodyConfirm,
  ReqBodyResending,
  ResLogin,
  ResMe,
  ReqBodyAuth,
} from "../auth";
import {
  authValidation,
  registrationValidation,
  confirmationValidation,
  resendingValidation,
} from "./validation";

export const authRouter = Router({});

export const authPath = {
  login: "/login",
  registration: "/registration",
  refreshToken: "/refresh-token",
  confirmRegistration: "/registration-confirmation",
  resendingEmail: "/registration-email-resending",
  logout: "/logout",
  me: "/me",
} as const;

authRouter.post(
  authPath.login,
  authValidation,
  async (req: Request<{}, {}, ReqBodyAuth>, res: Response<ResLogin>) => {
    const result = await authService.loginUser({ ...req.body, ip: req.ip });

    if (result) {
      const { name, value, options } = result.cookie;

      res
        .status(HTTP_STATUSES.OK_200)
        .cookie(name, value, options)
        .send({ accessToken: result.accessToken });
    } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);

authRouter.post(
  authPath.registration,
  registrationValidation,
  async (req: Request<{}, {}, ReqBodyUser>, res: Response<ResType>) => {
    const user = await usersService.createUser(req.body);

    if (user) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

authRouter.post(
  authPath.refreshToken,
  async (req: Request, res: Response<ResLogin>) => {
    const result = await authService.refreshToken(
      req.cookies?.refreshToken,
      req.ip
    );

    if (result) {
      const { name, value, options } = result.cookie;

      res
        .status(HTTP_STATUSES.OK_200)
        .cookie(name, value, options)
        .send({ accessToken: result.accessToken });
    } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);

authRouter.post(
  authPath.confirmRegistration,
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
  authPath.resendingEmail,
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

authRouter.post(
  authPath.logout,
  async (req: Request, res: Response<ResLogin>) => {
    const isLogout = await authService.logout(req.cookies?.refreshToken);

    if (isLogout) res.status(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);

authRouter.get(
  authPath.me,
  checkBearerAuth,
  async (req: Request, res: Response<ResMe>) => {
    const { id: userId, login, email } = req.requestContext.user as User;
    res.status(HTTP_STATUSES.OK_200).send({ userId, login, email });
  }
);
