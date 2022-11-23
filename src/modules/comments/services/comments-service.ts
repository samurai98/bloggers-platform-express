import { getCurrentDateISO } from 'common/helpers/utils';

import { commentsRepository, commentsQueryRepository } from '../repositories';
import { Comment, CommentDB, Reaction, ReqBodyComment } from '../comment';
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

  async updateReaction(commentId: string, { userId, status }: Omit<Reaction, 'createdAt'>): Promise<boolean> {
    const comment = await commentsQueryRepository.findCommentById(commentId);

    if (!comment) return false;

    const reaction = comment.reactions.find(reaction => reaction.userId === userId);
    const currentDate = getCurrentDateISO();
    const newReaction = { userId, status, createdAt: currentDate };

    if (!reaction) {
      if (status === 'None') return true;

      return await commentsRepository.createReaction(commentId, newReaction);
    }

    if (status === 'None' || reaction.status === status)
      return await commentsRepository.deleteReaction(commentId, newReaction);

    return await commentsRepository.updateReaction(commentId, newReaction);
  },
};
