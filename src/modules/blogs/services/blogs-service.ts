import { getCurrentDateISO } from '../../../common/helpers/utils';

import { blogsRepository } from '../repositories/blogs-repository';
import { Blog, ReqBodyBlog } from '../blog';

export const blogsService = {
  async createBlog({ name, websiteUrl, description }: ReqBodyBlog): Promise<Blog> {
    const currentDate = getCurrentDateISO();
    const newBlog: Blog = { id: currentDate, name, websiteUrl, description, createdAt: currentDate };

    return blogsRepository.createBlog(newBlog);
  },

  async updateBlog(id: string, blog: ReqBodyBlog): Promise<boolean> {
    return blogsRepository.updateBlog(id, blog);
  },

  async deleteBlog(id: string): Promise<boolean> {
    return blogsRepository.deleteBlog(id);
  },
};
