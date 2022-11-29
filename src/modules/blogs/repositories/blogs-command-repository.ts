import { BlogModel } from '../../../common/db';

import { BlogDB } from '../blog';

export const blogsCommandRepository = {
  async createBlog(blog: BlogDB): Promise<BlogDB> {
    await BlogModel.insertMany(blog);

    return blog;
  },

  async updateBlog(id: string, blog: Partial<BlogDB>): Promise<boolean> {
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
