import { PostModel } from 'common/db';

import { ReqBodyPost, PostDB } from '../post';

export const postsRepository = {
  async createPost(post: PostDB): Promise<PostDB> {
    await PostModel.insertMany(post);

    return post;
  },

  async updatePost(id: string, post: ReqBodyPost): Promise<boolean> {
    const result = await PostModel.updateOne({ id }, { $set: post });

    return result.matchedCount === 1;
  },

  async deletePost(id: string): Promise<boolean> {
    const result = await PostModel.deleteOne({ id });

    return result.deletedCount === 1;
  },

  async deleteAll(): Promise<boolean> {
    const result = await PostModel.deleteMany({});

    return result.deletedCount >= 1;
  },
};
