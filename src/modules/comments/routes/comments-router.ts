import { Router, Request, Response } from 'express';

import { ResType } from '../../../common/types/common';
import { HTTP_STATUSES } from '../../../common/http-statuses';
import { addLikeStatusRouter } from '../../../common/modules/reactions';

import { commentsService } from '../services/comments-service';
import { ReqBodyComment, ParamComment, ResComment } from '../comment';
import { deleteCommentValidation, updateCommentValidation } from './validation';

export const commentsRouter = Router({});

commentsRouter.get('/:commentId', async (req: Request<ParamComment>, res: Response<ResComment>) => {
  const comment = await commentsService.getCommentById(req.params.commentId, req.requestContext.user?.id);

  if (comment) res.send(comment);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

commentsRouter.put(
  '/:commentId',
  updateCommentValidation,
  async (req: Request<ParamComment, {}, ReqBodyComment>, res: Response<ResType>) => {
    const isUpdated = await commentsService.updateComment(req.params.commentId, req.body);

    if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

commentsRouter.delete(
  '/:commentId',
  deleteCommentValidation,
  async (req: Request<ParamComment>, res: Response<ResType>) => {
    const isDeleted = await commentsService.deleteComment(req.params.commentId);

    if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

addLikeStatusRouter('comments', commentsRouter);
