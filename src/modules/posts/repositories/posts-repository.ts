import { postsCollection } from "../../../common/db";
import { CreatePost, Post } from "../post";

export const postsRepository = {
  async createPost(post: Post): Promise<Post> {
    await postsCollection.insertOne({ ...post });

    return post;
  },

  async updatePost(id: string, post: CreatePost): Promise<boolean> {
    const result = await postsCollection.updateOne({ id }, { $set: post });

    return result.matchedCount === 1;
  },

  async deletePost(id: string): Promise<boolean> {
    const result = await postsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await postsCollection.deleteMany({});

    return result.deletedCount === 1;
  },
};
