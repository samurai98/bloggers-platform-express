import { Model } from 'mongoose';

import { ReactionDB, EntityDB } from 'common/types/reactions';

export const reactionsRepository = ({ Model }: { Model: Model<EntityDB> }) => ({
  async findEntityById(entityId: string): Promise<EntityDB | null> {
    return await Model.findOne({ id: entityId }, { _id: false, __v: false }).lean();
  },

  async updateReaction(entityId: string, { userId, status, createdAt }: ReactionDB): Promise<boolean> {
    const result = await Model.updateOne(
      { id: entityId },
      { $set: { 'reactions.$[elem].status': status, 'reactions.$[elem].createdAt': createdAt } },
      { arrayFilters: [{ 'elem.userId': userId }] }
    );

    return result.matchedCount === 1;
  },

  async createReaction(entityId: string, reaction: ReactionDB): Promise<boolean> {
    const result = await Model.updateOne({ id: entityId }, { $push: { reactions: reaction } });

    return result.matchedCount === 1;
  },

  async deleteReaction(entityId: string, { userId }: ReactionDB): Promise<boolean> {
    const result = await Model.updateOne({ id: entityId }, { $pull: { reactions: { userId } } });

    return result.matchedCount === 1;
  },
});
