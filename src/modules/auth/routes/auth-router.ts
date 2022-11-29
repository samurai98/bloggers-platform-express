import { Router, Request, Response } from 'express';

import { checkBearerAuth } from '../../../middlewares';
import { HTTP_STATUSES } from '../../../common/http-statuses';
import { ResErrorsMessages, ResType } from '../../../common/types/common';
import { getErrorsMessages } from '../../../common/helpers/utils';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

import { ReqBodyUser, User } from '../../users/user';
import { usersService } from '../../users/services/users-service';
import { authService } from '../services/auth-service';
import { ReqBodyConfirm, ReqBodyResending, ResLogin, ResMe, ReqBodyAuth, ReqBodyNewPassword } from '../auth';
import {
  authValidation,
  registrationValidation,
  confirmationValidation,
  resendingValidation,
  passwordRecoveryValidation,
  newPasswordValidation,
} from './validation';

export const authRouter = Router({});

export const authPath = {
  login: '/login',
  registration: '/registration',
  refreshToken: '/refresh-token',
  confirmRegistration: '/registration-confirmation',
  resendingEmail: '/registration-email-resending',
  logout: '/logout',
  me: '/me',
  passwordRecovery: '/password-recovery',
  newPassword: '/new-password',
} as const;

authRouter.post(authPath.login, authValidation, async (req: Request<{}, {}, ReqBodyAuth>, res: Response<ResLogin>) => {
  const result = await authService.loginUser({ ...req.body, ip: req.ip });

  if (result) {
    const { name, value, options } = result.cookie;

    res.status(HTTP_STATUSES.OK_200).cookie(name, value, options).send({ accessToken: result.accessToken });
  } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
});

authRouter.post(
  authPath.registration,
  registrationValidation,
  async (req: Request<{}, {}, ReqBodyUser>, res: Response<ResType>) => {
    const user = await usersService.createUser(req.body);

    if (user) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

authRouter.post(authPath.refreshToken, async (req: Request, res: Response<ResLogin>) => {
  const result = await authService.updateRefreshToken({
    refreshToken: req.cookies?.refreshToken,
    ip: req.ip,
    ua: req.headers['user-agent'],
  });

  if (result) {
    const { name, value, options } = result.cookie;

    res.status(HTTP_STATUSES.OK_200).cookie(name, value, options).send({ accessToken: result.accessToken });
  } else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
});

authRouter.post(
  authPath.confirmRegistration,
  confirmationValidation,
  async (req: Request<{}, {}, ReqBodyConfirm>, res: Response<ResErrorsMessages>) => {
    const result = await authService.confirmEmail(req.body.code);

    if (result) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else
      res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send(getErrorsMessages<ReqBodyConfirm>({ code: getErrorText(ERROR_TYPE.incorrect, 'code') }));
  }
);

authRouter.post(
  authPath.resendingEmail,
  resendingValidation,
  async (req: Request<{}, {}, ReqBodyResending>, res: Response<ResErrorsMessages>) => {
    const isResending = await authService.resendingEmail(req.body.email);

    if (isResending) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else
      res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send(getErrorsMessages<ReqBodyResending>({ email: getErrorText(ERROR_TYPE.incorrect, 'email') }));
  }
);

authRouter.post(authPath.logout, async (req: Request, res: Response<ResLogin>) => {
  const isLogout = await authService.logout(req.cookies?.refreshToken);

  if (isLogout) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
});

authRouter.get(authPath.me, checkBearerAuth, async (req: Request, res: Response<ResMe>) => {
  const { id: userId, login, email } = req.requestContext.user as User;
  res.status(HTTP_STATUSES.OK_200).send({ userId, login, email });
});

authRouter.post(
  authPath.passwordRecovery,
  passwordRecoveryValidation,
  async (req: Request<{}, {}, ReqBodyResending>, res: Response<ResType>) => {
    await authService.passwordRecovery(req.body.email);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  }
);

authRouter.post(
  authPath.newPassword,
  newPasswordValidation,
  async (req: Request<{}, {}, ReqBodyNewPassword>, res: Response<ResErrorsMessages>) => {
    const result = await authService.setNewPassword(req.body.recoveryCode, req.body.newPassword);

    if (result) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else
      res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send(
          getErrorsMessages<ReqBodyNewPassword>({
            recoveryCode: getErrorText(ERROR_TYPE.incorrect, 'recoveryCode'),
          } as ReqBodyNewPassword)
        );
  }
);
