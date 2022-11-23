import { CommentModel } from 'common/db';

import { CommentDB, Reaction, ReqBodyComment } from '../comment';

export const commentsRepository = {
  async createComment(comment: CommentDB): Promise<CommentDB> {
    await CommentModel.insertMany(comment);

    return comment;
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    const result = await CommentModel.updateOne({ id }, { $set: comment });

    return result.matchedCount === 1;
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async updateReaction(commentId: string, { userId, status, createdAt }: Reaction): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { commentId },
      { $set: { 'reactions.$[elem].status': status, 'reactions.$[elem].createdAt': createdAt } },
      { arrayFilters: [{ 'elem.userId': userId }] }
    );

    return result.matchedCount === 1;
  },

  async createReaction(commentId: string, reaction: Reaction): Promise<boolean> {
    const result = await CommentModel.updateOne({ commentId }, { $push: { reactions: reaction } });

    return result.matchedCount === 1;
  },

  async deleteReaction(commentId: string, { userId }: Reaction): Promise<boolean> {
    const result = await CommentModel.updateOne({ commentId }, { $pull: { reactions: { userId } } });

    return result.matchedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await CommentModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
