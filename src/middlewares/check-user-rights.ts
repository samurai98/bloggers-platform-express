import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUSES } from '../common/http-statuses';
import { ParamId } from '../common/types/common';

import { blogsQueryRepository } from '../modules/blogs/repositories';
import { postsQueryRepository } from '../modules/posts/repositories';
import { commentsQueryRepository } from '../modules/comments/repositories';
import { usersQueryRepository } from '../modules/users/repositories';

type EntityName = 'blog' | 'post' | 'comment' | 'user';

const entityById: Record<EntityName, (entityId: string) => Promise<{ userId: string } | null>> = {
  blog: blogsQueryRepository.findBlogById,
  post: postsQueryRepository.findPostById,
  comment: commentsQueryRepository.findCommentById,
  user: async (id: string) => {
    const user = await usersQueryRepository.findUser({ 'accountData.id': id });
    return user && { userId: user.accountData.id };
  },
};

export const checkUserRightsToEntity =
  (entityName: EntityName) => async (req: Request<ParamId>, res: Response, next: NextFunction) => {
    const currentUserId = req.requestContext.user?.id;
    const entity = await entityById[entityName](req.params.id);

    if (!entity) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    if (entity.userId !== currentUserId) res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
    else next();
  };
