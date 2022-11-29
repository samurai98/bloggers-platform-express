import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { checkRefreshSession, inputValidation, checkRequestsCount } from '../../../middlewares';
import { usersQueryRepository } from '../../users/repositories';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

import { sessionsService } from '../services/sessions-service';

export const loginValidation = body('login')
  .trim()
  .notEmpty()
  .isLength({ min: 3, max: 10 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'login', { min: 3, max: 10 }));

export const emailValidation = body('email')
  .trim()
  .notEmpty()
  .isEmail()
  .withMessage(getErrorText(ERROR_TYPE.incorrect, 'email'));

export const passwordValidation = (field: 'password' | 'newPassword') =>
  body(field)
    .trim()
    .notEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage(getErrorText(ERROR_TYPE.length, 'password', { min: 6, max: 20 }));

export const uniqueLoginAndEmailValidation = async (req: Request, res: Response, next: NextFunction) => {
  const login = req.body.login.trim() || '';
  const email = req.body.email.trim() || '';

  if (!login && !email) return next();

  const user = await usersQueryRepository.findUserByLoginAndEmail(login, email);

  if (user?.login === login) req.requestContext.validationErrors.login = getErrorText(ERROR_TYPE.taken, 'login');

  if (user?.email === email) req.requestContext.validationErrors.email = getErrorText(ERROR_TYPE.taken, 'email');

  next();
};

const loginAndPassValidation = body(['loginOrEmail', 'password'])
  .trim()
  .notEmpty()
  .withMessage(getErrorText(ERROR_TYPE.incorrect, 'login or password'));

const codeValidation = body('code').trim().notEmpty().withMessage(getErrorText(ERROR_TYPE.incorrect, 'code'));

const deviceIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const session = await sessionsService.getSessionByDeviceId(req.params.deviceId);

  if (!session) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  if (session.userId !== req.requestContext.user?.id) res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
  else next();
};

const recoveryCodeValidation = body('recoveryCode')
  .trim()
  .notEmpty()
  .withMessage(getErrorText(ERROR_TYPE.incorrect, 'recoveryCode'));

export const registrationValidation = [
  checkRequestsCount,
  loginValidation,
  emailValidation,
  passwordValidation('password'),
  uniqueLoginAndEmailValidation,
  inputValidation,
];

export const confirmationValidation = [checkRequestsCount, codeValidation, inputValidation];

export const resendingValidation = [checkRequestsCount, emailValidation, inputValidation];

export const authValidation = [checkRequestsCount, loginAndPassValidation, inputValidation];

export const deleteDeviceValidation = [checkRefreshSession, deviceIdValidation];

export const passwordRecoveryValidation = [checkRequestsCount, emailValidation, inputValidation];

export const newPasswordValidation = [
  checkRequestsCount,
  recoveryCodeValidation,
  passwordValidation('newPassword'),
  inputValidation,
];
