import { Express } from 'express';

import { blogsRouter } from './modules/blogs/routes/blogs-router';
import { postsRouter } from './modules/posts/routes/posts-router';
import { usersRouter } from './modules/users/routes/users-router';
import { authRouter } from './modules/auth/routes/auth-router';
import { securityDevicesRouter } from './modules/auth/routes/security-devices-router';
import { commentsRouter } from './modules/comments/routes/comments-router';
import { deleteAllRouter } from './common/routes/delete-router';
import { setUserToContextBySession } from './middlewares';

export const router = {
  blogs: '/blogs',
  posts: '/posts',
  comments: '/comments',
  users: '/users',
  auth: '/auth',
  securityDevices: '/security/devices',
  delete_all: '/testing/all-data',
} as const;

export const useRouters = (app: Express) => {
  app.use(setUserToContextBySession);

  app.use(router.blogs, blogsRouter);
  app.use(router.posts, postsRouter);
  app.use(router.comments, commentsRouter);
  app.use(router.users, usersRouter);
  app.use(router.auth, authRouter);
  app.use(router.securityDevices, securityDevicesRouter);

  app.use(router.delete_all, deleteAllRouter);
};
