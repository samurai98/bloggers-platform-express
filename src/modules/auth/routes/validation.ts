import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { checkRefreshSession, inputValidation, checkRequestsCount } from '../../../middlewares';
import { usersQueryRepository } from '../../users/repositories';

import { sessionsService } from '../services/sessions-service';

export const loginValidation = body('login')
  .trim()
  .notEmpty()
  .isLength({ min: 3, max: 10 })
  .withMessage('Login length error');

export const emailValidation = body('email').trim().notEmpty().isEmail().withMessage('Incorrect email');

export const passwordValidation = (field: 'password' | 'newPassword') =>
  body(field).trim().notEmpty().isLength({ min: 6, max: 20 }).withMessage('Password length error');

export const uniqueLoginAndEmailValidation = async (req: Request, res: Response, next: NextFunction) => {
  const login = req.body.login.trim() || '';
  const email = req.body.email.trim() || '';

  if (!login && !email) return next();

  const user = await usersQueryRepository.findUserByLoginAndEmail(login, email);

  if (user?.login === login) req.requestContext.validationErrors.login = 'This login taken';

  if (user?.email === email) req.requestContext.validationErrors.email = 'This email is already registered';

  next();
};

const loginAndPassValidation = body(['loginOrEmail', 'password'])
  .trim()
  .notEmpty()
  .withMessage('Login or password incorrect');

const codeValidation = body('code').trim().notEmpty().withMessage('Code incorrect');

const deviceIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const session = await sessionsService.getSessionByDeviceId(req.params.deviceId);

  if (!session) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  if (session.userId !== req.requestContext.user?.id) res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
  else next();
};

const recoveryCodeValidation = body('recoveryCode').trim().notEmpty().withMessage('RecoveryCode incorrect');

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
