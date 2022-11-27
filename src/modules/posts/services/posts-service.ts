import { getCurrentDateISO } from '../../../common/helpers/utils';
import { blogsQueryRepository } from '../../blogs/repositories';
import { Blog } from '../../blogs/blog';

import { ReqBodyPost, Post, PostDB } from '../post';
import { postsRepository } from '../repositories';
import { postMapper } from './posts-mapper';

export const postsService = {
  async createPost({ title, shortDescription, content, blogId }: ReqBodyPost, userId?: string): Promise<Post> {
    const { name: blogName } = (await blogsQueryRepository.findBlogById(blogId)) as Blog;

    const currentDate = getCurrentDateISO();
    const newPost: PostDB = {
      id: currentDate,
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      createdAt: currentDate,
      reactions: [],
    };

    return postMapper(await postsRepository.createPost(newPost), userId, []);
  },

  async updatePost(id: string, post: ReqBodyPost): Promise<boolean> {
    return postsRepository.updatePost(id, post);
  },

  async deletePost(id: string): Promise<boolean> {
    return postsRepository.deletePost(id);
  },
};
