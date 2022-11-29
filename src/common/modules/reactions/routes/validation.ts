import { body } from 'express-validator';

import { likeStatuses } from '../../../types/reactions';
import { checkBearerAuth, inputValidation } from '../../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../../common/messages';

const likeStatusValidation = body('likeStatus')
  .trim()
  .notEmpty()
  .isIn(likeStatuses)
  .withMessage(getErrorText(ERROR_TYPE.incorrect, 'likeStatus'));

export const updateLikeStatusValidation = [checkBearerAuth, likeStatusValidation, inputValidation];
