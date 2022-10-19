import { blogsCollection } from "common/db";

import { Blog, ReqBodyBlog } from "../blog";

export const blogsRepository = {
  async createBlog(blog: Blog): Promise<Blog> {
    await blogsCollection.insertOne({ ...blog });

    return blog;
  },

  async updateBlog(id: string, blog: ReqBodyBlog): Promise<boolean> {
    const result = await blogsCollection.updateOne({ id }, { $set: blog });

    return result.matchedCount === 1;
  },

  async deleteBlog(id: string): Promise<boolean> {
    const result = await blogsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await blogsCollection.deleteMany({});

    return result.deletedCount === 1;
  },
};
