import { body } from 'express-validator';

import { likeStatuses } from 'common/types/reactions';

import { checkBearerAuth, inputValidation } from 'middlewares';

const likeStatusValidation = body('likeStatus')
  .trim()
  .notEmpty()
  .isIn(likeStatuses)
  .withMessage('Incorrect likeStatus');

export const updateLikeStatusValidation = [checkBearerAuth, likeStatusValidation, inputValidation];
