import { FilterQuery } from 'mongoose';

import { getPagesCount, getSkipCount } from 'common/helpers/pagination';

import { Comment, CommentDB, ReqQueryComment, ResComments } from '../comment';
import { commentsQueryRepository } from '../repositories';
import { commentMapper } from './comments-mapper';

export const commentsStory = {
  async getComments(
    { pageNumber, pageSize, sortBy, sortDirection, postId }: ReqQueryComment,
    currentUserId: string | undefined
  ): Promise<ResComments> {
    const filter: FilterQuery<CommentDB> = postId ? { postId } : {};
    const totalCount = await commentsQueryRepository.countTotalComments(filter);
    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const commentsDB = await commentsQueryRepository.findComments(filter, { sortBy, sortDirection, skipCount, pageSize });

    const comments = commentsDB.map(item => commentMapper(item, currentUserId));

    return { pagesCount, page: pageNumber, pageSize, totalCount, items: comments };
  },

  async getCommentById(commentId: string, currentUserId: string | undefined): Promise<Comment | null> {
    const comment = await commentsQueryRepository.findCommentById(commentId);

    return comment && commentMapper(comment, currentUserId);
  },
};
