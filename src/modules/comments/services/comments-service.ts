import { FilterQuery } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentDateISO } from '../../../common/helpers/utils';
import { getSkipCount, getPagesCount } from '../../../common/helpers/pagination';
import { Pagination } from '../../../common/types/common';
import { usersQueryRepository } from '../../users/repositories';
import { User } from '../../users/user';

import { commentsCommandRepository, commentsQueryRepository } from '../repositories';
import { Comment, CommentDB, ReqBodyComment, ReqQueryComment, ResComments } from '../comment';
import { commentMapper } from './comments-mapper';

export const commentsService = {
  async getComments(
    { pageNumber, pageSize, sortBy, sortDirection, postId }: ReqQueryComment,
    currentUserId: string | undefined
  ): Promise<Pagination<Comment>> {
    const filter: FilterQuery<CommentDB> = postId ? { postId } : {};
    const totalCount = await commentsQueryRepository.countTotalComments(filter);
    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const commentsDB = await commentsQueryRepository.findComments(filter, {
      sortBy,
      sortDirection,
      skipCount,
      pageSize,
    });
    const comments: Comment[] = [];

    for (const commentDB of commentsDB) {
      const commentator = await usersQueryRepository.findUserById(commentDB.userId);
      const comment = commentator && commentMapper(commentDB, currentUserId, commentator.login);
      comment && comments.push(comment);
    }

    return { pagesCount, page: pageNumber, pageSize, totalCount, items: comments };
  },

  async getCommentById(commentId: string, currentUserId: string | undefined): Promise<Comment | null> {
    const comment = await commentsQueryRepository.findCommentById(commentId);
    const commentator = comment && (await usersQueryRepository.findUserById(comment.userId));

    return commentator && commentMapper(comment, currentUserId, commentator.login);
  },

  async createComment({ content, postId }: ReqBodyComment, user: User): Promise<Comment> {
    const currentDate = getCurrentDateISO();
    const newComment: CommentDB = { id: uuidv4(), content, postId, userId: user.id, createdAt: currentDate, reactions: [] };
    const createdComment = await commentsCommandRepository.createComment(newComment);

    return commentMapper(createdComment, user.id, user.login);
  },

  async updateComment(id: string, comment: ReqBodyComment): Promise<boolean> {
    return await commentsCommandRepository.updateComment(id, comment);
  },

  async deleteComment(id: string): Promise<boolean> {
    return await commentsCommandRepository.deleteComment(id);
  },
};
