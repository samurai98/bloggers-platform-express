import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { checkBearerAuth, inputValidation } from '../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

import { commentsService } from '../services/comments-service';

const contentValidation = body('content')
  .trim()
  .notEmpty()
  .isLength({ min: 20, max: 300 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'content', { min: 20, max: 300 }));

const checkUserRights = async (req: Request, res: Response, next: NextFunction) => {
  const currentUserId = req.requestContext.user?.id;
  const comment = await commentsService.getCommentById(req.params.commentId, currentUserId);

  if (!comment) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  if (comment.userId !== currentUserId) res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
  else next();
};

export const updateCommentValidation = [checkBearerAuth, checkUserRights, contentValidation, inputValidation];

export const deleteCommentValidation = [checkBearerAuth, checkUserRights];

export const commentByPostIdValidation = [checkBearerAuth, contentValidation, inputValidation];
