import { blogsQueryRepository } from "../../blogs/repositories";
import { Blog } from "../../blogs/blog";
import { postsRepository } from "../repositories/posts-repository";
import { ReqBodyPost, Post } from "../post";

export const postsService = {
  async createPost({
    title,
    shortDescription,
    content,
    blogId,
  }: ReqBodyPost): Promise<Post> {
    const { name: blogName } = (await blogsQueryRepository.findBlogById(
      blogId
    )) as Blog;

    const currentDate = new Date().toISOString();
    const newPost: Post = {
      id: new Date().toISOString(),
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      createdAt: currentDate,
    };

    return postsRepository.createPost(newPost);
  },

  async updatePost(id: string, post: ReqBodyPost): Promise<boolean> {
    return postsRepository.updatePost(id, post);
  },

  async deletePost(id: string): Promise<boolean> {
    return postsRepository.deletePost(id);
  },
};
