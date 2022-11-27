import { LikesInfo } from '../../../common/types/reactions';

import { Comment, CommentDB } from '../comment';

export const commentMapper = (commentDB: CommentDB, currentUserId: string | undefined): Comment => {
  const { id, content, userId, userLogin, createdAt, reactions } = commentDB;

  const likesCount = reactions.filter(reaction => reaction.status === 'Like').length;
  const likesInfo: LikesInfo = {
    likesCount,
    dislikesCount: reactions.length - likesCount,
    myStatus: reactions.find(reaction => reaction.userId === currentUserId)?.status || 'None',
  };

  return { id, content, userId, userLogin, createdAt, likesInfo };
};
