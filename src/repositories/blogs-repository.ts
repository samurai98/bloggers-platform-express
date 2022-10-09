import { blogsCollection } from "./db";
import { Blog } from "./types";

export const blogsRepository = {
  async getAllBlogs(): Promise<Blog[]> {
    return blogsCollection.find({}).toArray();
  },

  async findBlogById(id: string): Promise<Blog | null> {
    return blogsCollection.findOne({ id });
  },

  async createBlog({ name, youtubeUrl }: Blog): Promise<Blog> {
    const currentDate = new Date().toISOString();
    const newBlog: Blog = {
      id: currentDate,
      name,
      youtubeUrl,
      createdAt: currentDate,
    };

    await blogsCollection.insertOne(newBlog);

    return newBlog;
  },

  async updateBlog(id: string, blog: Blog): Promise<boolean> {
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
