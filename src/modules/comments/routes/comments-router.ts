import { Router, Request, Response } from 'express';

import { ResType, ParamId } from '../../../common/types/common';
import { HTTP_STATUSES } from '../../../common/http-statuses';
import { addLikeStatusRouter } from '../../../common/modules/reactions';

import { commentsService } from '../services/comments-service';
import { ReqBodyComment, ResComment } from '../comment';
import { deleteCommentValidation, updateCommentValidation } from './validation';

export const commentsRouter = Router({});

commentsRouter.get('/:id', async (req: Request<ParamId>, res: Response<ResComment>) => {
  const comment = await commentsService.getCommentById(req.params.id, req.requestContext.user?.id);

  if (comment) res.send(comment);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

commentsRouter.put(
  '/:id',
  updateCommentValidation,
  async (req: Request<ParamId, {}, ReqBodyComment>, res: Response<ResType>) => {
    const isUpdated = await commentsService.updateComment(req.params.id, req.body);

    if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

commentsRouter.delete('/:id', deleteCommentValidation, async (req: Request<ParamId>, res: Response<ResType>) => {
  const isDeleted = await commentsService.deleteComment(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

addLikeStatusRouter('comments', commentsRouter);
