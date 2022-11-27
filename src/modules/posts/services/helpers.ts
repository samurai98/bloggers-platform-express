import { NewestLike, ReactionDB } from '../../../common/types/reactions';
import { stringDateToMs } from '../../../common/helpers/utils';
import { usersQueryRepository } from '../../users/repositories';

const LAST_LIKES_COUNT = 3;

const getLastLikes = (reactions: ReactionDB[]) =>
  reactions
    .filter(reaction => reaction.status === 'Like')
    .sort((a, b) => {
      const aCreatedAt = stringDateToMs(a.createdAt);
      const bCreatedAt = stringDateToMs(b.createdAt);

      if (aCreatedAt > bCreatedAt) return -1;
      if (aCreatedAt < bCreatedAt) return 1;
      else return 0;
    })
    .slice(0, LAST_LIKES_COUNT);

export const getNewestLikes = async (reactions: ReactionDB[]) => {
  const lastLikes = getLastLikes(reactions);

  const newestLikes: NewestLike[] = [];

  for (const reaction of lastLikes) {
    const user = await usersQueryRepository.findUserById(reaction.userId);
    user && newestLikes.push({ userId: reaction.userId, login: user.login, addedAt: reaction.createdAt });
  }

  return newestLikes;
};
