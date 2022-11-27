import { Router, Request, Response } from 'express';

import { checkRefreshSession } from '../../../middlewares';
import { HTTP_STATUSES } from '../../../common/http-statuses';
import { ResType } from '../../../common/types/common';

import { sessionsService } from '../services/sessions-service';
import { ParamDevice, ResDevices } from '../auth';
import { deleteDeviceValidation } from './validation';

export const securityDevicesRouter = Router({});

securityDevicesRouter.get('/', checkRefreshSession, async (req: Request, res: Response<ResDevices>) => {
  const sessions = await sessionsService.getActiveSessions(req.requestContext.user?.id);

  if (sessions) res.status(HTTP_STATUSES.OK_200).send(sessions);
  else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
});

securityDevicesRouter.delete('/', checkRefreshSession, async (req: Request, res: Response<ResType>) => {
  const isDeleted = await sessionsService.deleteAllSessionsExcludeCurrent(
    req.cookies?.refreshToken,
    req.requestContext.user?.id
  );

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
});

securityDevicesRouter.delete(
  '/:deviceId',
  deleteDeviceValidation,
  async (req: Request<ParamDevice>, res: Response<ResType>) => {
    const isDeleted = await sessionsService.deleteSessionByDeviceId(req.params.deviceId);

    if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);
