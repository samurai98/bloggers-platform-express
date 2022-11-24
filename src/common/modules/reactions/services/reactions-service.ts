import { getCurrentDateISO } from 'common/helpers/utils';
import { EntityDependencies, ReactionDB } from 'common/types/reactions';

import { reactionsRepository } from '../repositories/reactions-repository';

export const reactionsService = ({ entityModel }: EntityDependencies) => {
  const repository = reactionsRepository({ Model: entityModel });

  return {
    async updateReaction(entityId: string, { userId, status }: Omit<ReactionDB, 'createdAt'>): Promise<boolean> {
      const entity = await repository.findEntityById(entityId);

      if (!entity) return false;

      const reaction = entity.reactions.find(reaction => reaction.userId === userId);
      const currentDate = getCurrentDateISO();
      const newReaction = { userId, status, createdAt: currentDate };

      if (!reaction) {
        if (status === 'None') return true;

        return await repository.createReaction(entityId, newReaction);
      }

      if (status === 'None') return await repository.deleteReaction(entityId, newReaction);

      if (reaction.status !== status) return await repository.updateReaction(entityId, newReaction);

      return true;
    },
  };
};
