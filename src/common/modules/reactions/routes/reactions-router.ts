import { Router, Request, Response } from 'express';

import { ResType } from 'common/types/common';
import { HTTP_STATUSES } from 'common/http-statuses';
import { EntityDependencies, ParamEntity, ReqBodyLikeStatus } from 'common/types/reactions';

import { reactionsService } from '../services/reactions-service';
import { updateLikeStatusValidation } from './validation';

export const getReactionsRouter = (entityRouter: Router, dependencies: EntityDependencies) => {
  const service = reactionsService(dependencies);

  entityRouter.put(
    '/:entityId/like-status',
    updateLikeStatusValidation,
    async (req: Request<ParamEntity, {}, ReqBodyLikeStatus>, res: Response<ResType>) => {
      const result = await service.updateReaction(req.params.entityId, {
        status: req.body.likeStatus,
        userId: req.requestContext.user!.id,
      });

      if (result) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
      else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  );
};
