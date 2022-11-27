import { Router } from 'express';

import { CommentModel, PostModel } from '../../../common/db';
import { EntityName, EntityDependencies } from '../../types/reactions';

import { getReactionsRouter } from './routes/reactions-router';

const entityDependencies = {} as Record<EntityName, EntityDependencies>;

entityDependencies.comments = { entityModel: CommentModel };

entityDependencies.posts = { entityModel: PostModel };

export const addLikeStatusRouter = (entityName: EntityName, entityRouter: Router) => {
  const dependencies = entityDependencies[entityName];

  getReactionsRouter(entityRouter, dependencies);
};
