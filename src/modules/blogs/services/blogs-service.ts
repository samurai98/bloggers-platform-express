import { blogsRepository } from "../repositories/blogs-repository";
import { Blog, CreateBlog } from "../blog";

export const blogsService = {
  async createBlog({ name, youtubeUrl }: CreateBlog): Promise<Blog> {
    const currentDate = new Date().toISOString();
    const newBlog: Blog = {
      id: currentDate,
      name,
      youtubeUrl,
      createdAt: currentDate,
    };

    return blogsRepository.createBlog(newBlog);
  },

  async updateBlog(id: string, blog: CreateBlog): Promise<boolean> {
    return blogsRepository.updateBlog(id, blog);
  },

  async deleteBlog(id: string): Promise<boolean> {
    return blogsRepository.deleteBlog(id);
  },
};
