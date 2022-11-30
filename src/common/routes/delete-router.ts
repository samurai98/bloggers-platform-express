import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../http-statuses';
import { blogsCommandRepository } from '../../modules/blogs/repositories';
import { postsCommandRepository } from '../../modules/posts/repositories';
import { usersCommandRepository } from '../../modules/users/repositories';
import { commentsCommandRepository } from '../../modules/comments/repositories';
import { sessionsCommandRepository } from '../../modules/auth/repositories';

export const deleteAllRouter = Router({});

deleteAllRouter.delete('/', async (req: Request, res: Response) => {
  await postsCommandRepository.deleteAll();
  await blogsCommandRepository.deleteAll();
  await usersCommandRepository.deleteAll();
  await commentsCommandRepository.deleteAll();
  await sessionsCommandRepository.deleteAll();

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
