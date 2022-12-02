import { FilterQuery } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentDateISO } from '../../../common/helpers/utils';
import { getPagesCount, getSkipCount } from '../../../common/helpers/pagination';
import { Pagination, Query } from '../../../common/types/common';
import { blogsService } from '../../blogs/services/blogs-service';
import { Blog } from '../../blogs/blog';
import { commentsService } from '../../comments/services/comments-service';
import { Comment } from '../../comments/comment';
import { User } from '../../users/user';

import { postsQueryRepository } from '../repositories';
import { getNewestLikes } from './helpers';
import { ReqBodyPost, Post, PostDB, ReqQueryPost, ReqBodyCommentByPostId } from '../post';
import { postsCommandRepository } from '../repositories';
import { postMapper } from './posts-mapper';

export const postsService = {
  async getPosts(
    { pageNumber, pageSize, sortBy, sortDirection, blogId }: ReqQueryPost,
    currentUserId: string | undefined
  ): Promise<Pagination<Post>> {
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

  async createPost({ title, shortDescription, content, blogId }: ReqBodyPost, currentUserId: string): Promise<Post> {
    const { name: blogName } = (await blogsService.getBlogById(blogId)) as Blog;

    const currentDate = getCurrentDateISO();
    const newPost: PostDB = {
      id: uuidv4(),
      title,
      shortDescription,
      content,
      userId: currentUserId,
      blogId,
      blogName,
      createdAt: currentDate,
      reactions: [],
    };
    const createdPost = await postsCommandRepository.createPost(newPost);

    return postMapper(createdPost, currentUserId, []);
  },

  async updatePost(id: string, post: ReqBodyPost): Promise<boolean> {
    return await postsCommandRepository.updatePost(id, post);
  },

  async deletePost(id: string): Promise<boolean> {
    const isDeleted = await commentsService.deleteAllCommentsWhere({ postId: id });

    return isDeleted && (await postsCommandRepository.deletePost(id));
  },

  async deleteAllPostsWhere(filter: FilterQuery<PostDB>): Promise<boolean> {
    const posts = await postsQueryRepository.findPostsWhere(filter);
    const isDeleted = await commentsService.deleteAllCommentsWhere({ $or: posts.map(post => ({ postId: post.id })) });

    return isDeleted && (await postsCommandRepository.deleteAllWhere(filter));
  },

  async getCommentsByPostId(
    postId: string,
    userId: string | undefined,
    query: Query
  ): Promise<Pagination<Comment> | null> {
    if (!postId || !(await this.getPostById(postId, undefined))) return null;

    return await commentsService.getComments({ ...query, postId }, userId);
  },

  async createCommentByPostId(postId: string, user: User, body: ReqBodyCommentByPostId): Promise<Comment | null> {
    if (!postId || !(await postsService.getPostById(postId, undefined))) return null;

    return await commentsService.createComment({ ...body, postId }, user);
  },
};
