import { postsCollection } from "./db";
import { Post } from "./types";

const _posts: Post[] = [];

export const postsRepository = {
  async getAllPosts() {
    return postsCollection.find({}).toArray();
  },

  async findPostById(id: string) {
    return postsCollection.findOne({ id });
  },

  async createPost({
    title,
    shortDescription,
    content,
    blogId,
    blogName,
  }: Post) {
    const currentDate = new Date().toISOString();
    const newPost: Post = {
      id: new Date().toISOString(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blogName || "no blog name",
      createdAt: currentDate,
    };

    await postsCollection.insertOne(newPost);

    return newPost;
  },

  async updatePost(id: string, post: Post) {
    const result = await postsCollection.updateOne({ id }, { $set: post });

    return result.matchedCount === 1;
  },

  async deletePost(id: string) {
    const result = await postsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await postsCollection.deleteMany({});

    return result.deletedCount === 1;
  },
};
