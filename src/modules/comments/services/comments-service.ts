import { getCurrentDateISO } from "common/helpers/utils";

import { commentsRepository } from "../repositories/comments-repository";
import { Comment, CommentDB, ReqBodyComment } from "../comment";

export const commentsService = {
  async createComment({
    content,
    postId,
    userId,
    userLogin,
  }: ReqBodyComment & { userId: string; userLogin: string }): Promise<Comment> {
    const currentDate = getCurrentDateISO();
    const newComment: CommentDB = {
      id: currentDate,
      content,
      postId,
      userId,
      userLogin,
      createdAt: currentDate,
    };

    return commentsRepository.createComment(newComment);
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    return commentsRepository.updateComment(id, comment);
  },

  async deleteComment(id: string): Promise<boolean> {
    return commentsRepository.deleteComment(id);
  },
};
