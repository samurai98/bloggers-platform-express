import { FilterQuery } from 'mongoose';

import { getPagesCount, getSkipCount } from '../../../common/helpers/pagination';

import { Post, PostDB, ReqQueryPost, ResPosts } from '../post';
import { postsQueryRepository } from '../repositories';
import { postMapper } from './posts-mapper';
import { getNewestLikes } from './helpers';

export const postsStory = {
  async getPosts(
    { pageNumber, pageSize, sortBy, sortDirection, blogId }: ReqQueryPost,
    currentUserId: string | undefined
  ): Promise<ResPosts> {
    const filter: FilterQuery<PostDB> = blogId ? { blogId } : {};
    const totalCount = await postsQueryRepository.countTotalPosts(filter);
    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const postsDB = await postsQueryRepository.findPosts(filter, { sortBy, sortDirection, skipCount, pageSize });

    const posts: Post[] = [];

    for (const post of postsDB) {
      const newestLikes = await getNewestLikes(post.reactions);
      posts.push(postMapper(post, currentUserId, newestLikes));
    }

    return { pagesCount, page: pageNumber, pageSize, totalCount, items: posts };
  },

  async getPostById(postId: string, currentUserId: string | undefined): Promise<Post | null> {
    const post = await postsQueryRepository.findPostById(postId);
    const newestLikes = post && (await getNewestLikes(post.reactions));

    return post && postMapper(post, currentUserId, newestLikes || []);
  },
};
