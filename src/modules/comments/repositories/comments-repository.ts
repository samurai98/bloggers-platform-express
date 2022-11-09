import { CommentModel } from "common/db";

import { Comment, CommentDB, ReqBodyComment } from "../comment";

export const commentsRepository = {
  async createComment(comment: CommentDB): Promise<Comment> {
    await CommentModel.insertMany(comment);

    const { postId, ...clearComment } = comment;
    return clearComment;
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { id },
      { $set: comment }
    );

    return result.matchedCount === 1;
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await CommentModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
