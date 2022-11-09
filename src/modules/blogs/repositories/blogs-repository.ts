import { BlogModel } from "common/db";

import { Blog, ReqBodyBlog } from "../blog";

export const blogsRepository = {
  async createBlog(blog: Blog): Promise<Blog> {
    await BlogModel.insertMany({ ...blog });

    return blog;
  },

  async updateBlog(id: string, blog: ReqBodyBlog): Promise<boolean> {
    const result = await BlogModel.updateOne({ id }, { $set: blog });

    return result.matchedCount === 1;
  },

  async deleteBlog(id: string): Promise<boolean> {
    const result = await BlogModel.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await BlogModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
