import { commentsCollection } from "common/db";

import { Comment, CommentDB, ReqBodyComment } from "../comment";

export const commentsRepository = {
  async createComment(comment: CommentDB): Promise<Comment> {
    await commentsCollection.insertOne({ ...comment });

    const { postId, ...clearComment } = comment;
    return clearComment;
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    const result = await commentsCollection.updateOne(
      { id },
      { $set: comment }
    );

    return result.matchedCount === 1;
  },

  async deleteComment(id: string): Promise<boolean> {
    const result = await commentsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await commentsCollection.deleteMany({});

    return result.deletedCount === 1;
  },
};
