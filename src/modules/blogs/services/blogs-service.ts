import { FilterQuery } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentDateISO } from '../../../common/helpers/utils';
import { getSkipCount, getPagesCount } from '../../../common/helpers/pagination';
import { Pagination, Query } from '../../../common/types/common';
import { Post } from '../../posts/post';
import { postsService } from '../../posts/services/posts-service';

import { Blog, BlogDB, ReqBodyBlog, ReqBodyPostByBlogId, ReqQueryBlog } from '../blog';
import { blogsCommandRepository, blogsQueryRepository } from '../repositories';
import { blogMapper } from './blogs-mapper';

export const blogsService = {
  async getBlogs({
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchNameTerm,
  }: ReqQueryBlog): Promise<Pagination<Blog>> {
    const filter: FilterQuery<BlogDB> = { name: { $regex: new RegExp(`${searchNameTerm}`, 'i') } };
    const totalCount = await blogsQueryRepository.countTotalBlogs(filter);
    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const blogsDB = await blogsQueryRepository.findBlogs(filter, { sortBy, sortDirection, skipCount, pageSize });
    const blogs = blogsDB.map(blog => blogMapper(blog));

    return { pagesCount, page: pageNumber, pageSize, totalCount, items: blogs };
  },

  async getBlogById(blogId: string): Promise<Blog | null> {
    const blog = await blogsQueryRepository.findBlogById(blogId);

    return blog && blogMapper(blog);
  },

  async getBlogDBbyId(blogId: string): Promise<BlogDB | null> {
    return await blogsQueryRepository.findBlogById(blogId);
  },

  async createBlog({ name, websiteUrl, description, userId }: ReqBodyBlog & { userId: string }): Promise<Blog> {
    const currentDate = getCurrentDateISO();
    const newBlog: BlogDB = { id: uuidv4(), name, websiteUrl, description, userId, createdAt: currentDate };

    return blogMapper(await blogsCommandRepository.createBlog(newBlog));
  },

  async updateBlog(id: string, blog: ReqBodyBlog): Promise<boolean> {
    return await blogsCommandRepository.updateBlog(id, blog);
  },

  async deleteBlog(id: string): Promise<boolean> {
    const isDeleted = await postsService.deleteAllPostsWhere({ blogId: id });

    return isDeleted && (await blogsCommandRepository.deleteBlog(id));
  },

  async getPostsByBlogId(blogId: string, userId: string | undefined, query: Query): Promise<Pagination<Post> | null> {
    if (!blogId || !(await this.getBlogById(blogId))) return null;

    return await postsService.getPosts({ ...query, blogId }, userId);
  },

  async createPostByBlogId(blogId: string, userId: string, body: ReqBodyPostByBlogId): Promise<Post | null> {
    if (!blogId || !(await this.getBlogById(blogId))) return null;

    return await postsService.createPost({ ...body, blogId }, userId);
  },
};
