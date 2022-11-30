import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { ResType } from '../../../common/types/common';

import { usersService } from '../services/users-service';
import { ParamUser, ReqQueryUser, ResUsers } from '../user';
import { usersQueryValidation, checkBearerAuth } from './validation';

export const usersRouter = Router({});

usersRouter.get('/', usersQueryValidation, async (req: Request<{}, {}, {}, ReqQueryUser>, res: Response<ResUsers>) => {
  res.send(await usersService.getUsers(req.query));
});

usersRouter.delete('/:id', checkBearerAuth, async (req: Request<ParamUser>, res: Response<ResType>) => {
  const isDeleted = await usersService.deleteUser(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});
