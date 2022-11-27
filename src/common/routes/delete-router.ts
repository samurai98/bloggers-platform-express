import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../http-statuses';
import { blogsRepository } from '../../modules/blogs/repositories';
import { postsRepository } from '../../modules/posts/repositories';
import { usersRepository } from '../../modules/users/repositories';
import { commentsRepository } from '../../modules/comments/repositories';
import { sessionRepository } from '../../modules/auth/repositories/session-repository';

export const deleteAllRouter = Router({});

deleteAllRouter.delete('/', async (req: Request, res: Response) => {
  await postsRepository.deleteAll();
  await blogsRepository.deleteAll();
  await usersRepository.deleteAll();
  await commentsRepository.deleteAll();
  await sessionRepository.deleteAll();

  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
