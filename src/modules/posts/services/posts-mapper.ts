import { LikesInfo, NewestLike } from 'common/types/reactions';

import { Post, PostDB } from '../post';

export const postMapper = (postDB: PostDB, currentUserId: string | undefined, newestLikes: NewestLike[]): Post => {
  const { id, title, shortDescription, content, blogId, blogName, createdAt, reactions } = postDB;

  const likesCount = reactions.filter(reaction => reaction.status === 'Like').length;
  const likesInfo: LikesInfo = {
    likesCount,
    dislikesCount: reactions.length - likesCount,
    myStatus: reactions.find(reaction => reaction.userId === currentUserId)?.status || 'None',
  };

  return {
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
    createdAt,
    extendedLikesInfo: { ...likesInfo, newestLikes },
  };
};
