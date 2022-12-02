import { FilterQuery } from 'mongoose';

import { CommentModel } from '../../../common/db';

import { CommentDB } from '../comment';

export const commentsCommandRepository = {
  async createComment(comment: CommentDB): Promise<CommentDB> {
    await CommentModel.insertMany(comment);

    return comment;
  },

  async updateComment(id: string, comment: Partial<CommentDB>): Promise<boolean> {
    const result = await CommentModel.updateOne({ id }, { $set: comment });

    return result.matchedCount === 1;
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAllWhere(filter: FilterQuery<CommentDB>): Promise<boolean> {
    const result = await CommentModel.deleteMany(filter);

    return result.deletedCount >= 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await CommentModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
