import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../http-statuses';
import { blogsCommandRepository } from '../../modules/blogs/repositories';
import { postsCommandRepository } from '../../modules/posts/repositories';
import { usersCommandRepository } from '../../modules/users/repositories';
import { commentsCommandRepository } from '../../modules/comments/repositories';
import { sessionRepository } from '../../modules/auth/repositories/session-repository';

export const deleteAllRouter = Router({});

deleteAllRouter.delete('/', async (req: Request, res: Response) => {
  await postsCommandRepository.deleteAll();
  await blogsCommandRepository.deleteAll();
  await usersCommandRepository.deleteAll();
  await commentsCommandRepository.deleteAll();
  await sessionRepository.deleteAll();

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
