import { body } from 'express-validator';

import { checkBearerAuth, checkUserRightsToEntity, inputValidation } from '../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

const contentValidation = body('content')
  .trim()
  .notEmpty()
  .isLength({ min: 20, max: 300 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'content', { min: 20, max: 300 }));

export const updateCommentValidation = [
  checkBearerAuth,
  checkUserRightsToEntity('comment'),
  contentValidation,
  inputValidation,
];

export const deleteCommentValidation = [checkBearerAuth, checkUserRightsToEntity('comment')];

export const commentByPostIdValidation = [checkBearerAuth, contentValidation, inputValidation];
