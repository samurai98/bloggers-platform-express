import { getCurrentDateISO } from '../../../common/helpers/utils';

import { commentsRepository } from '../repositories';
import { Comment, CommentDB, ReqBodyComment } from '../comment';
import { commentMapper } from './comments-mapper';

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
      reactions: [],
    };

    return commentMapper(await commentsRepository.createComment(newComment), userId);
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    return await commentsRepository.updateComment(id, comment);
  },

  async deleteComment(id: string): Promise<boolean> {
    return await commentsRepository.deleteComment(id);
  },
};
