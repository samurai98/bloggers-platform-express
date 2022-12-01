import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { ParamId, ResType } from '../../../common/types/common';

import { usersService } from '../services/users-service';
import { ReqQueryUser, ResUsers, ResUser } from '../user';
import { usersQueryValidation, deleteUserValidation } from './validation';

export const usersRouter = Router({});

usersRouter.get('/', usersQueryValidation, async (req: Request<{}, {}, {}, ReqQueryUser>, res: Response<ResUsers>) => {
  res.send(await usersService.getUsers(req.query));
});

usersRouter.get('/:id', async (req: Request<ParamId>, res: Response<ResUser>) => {
  const user = await usersService.getUserById(req.params.id);

  if (user) res.send(user);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

usersRouter.delete('/:id', deleteUserValidation, async (req: Request<ParamId>, res: Response<ResType>) => {
  const isDeleted = await usersService.deleteUser(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});
