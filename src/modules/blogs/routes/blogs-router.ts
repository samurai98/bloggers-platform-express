import { Router, Request, Response } from 'express';

import { Query, ResType } from 'common/types/common';
import { HTTP_STATUSES } from 'common/http-statuses';
import { ResPost, ResPosts } from 'modules/posts/post';
import { postsService } from 'modules/posts/services/posts-service';
import { postByBlogIdValidation } from 'modules/posts/routes/validation';

import { blogsService } from '../services/blogs-service';
import { blogsQueryRepository } from '../repositories';
import { ReqBodyBlog, ReqBodyPostByBlogId, ParamBlog, ReqQueryBlog, ResBlog, ResBlogs } from '../blog';
import { checkBasicAuth, blogValidation, blogsQueryValidation, postsByBlogQueryValidation } from './validation';
import { postsStory } from 'modules/posts/services';

export const blogsRouter = Router({});

blogsRouter.get('/', blogsQueryValidation, async (req: Request<{}, {}, {}, ReqQueryBlog>, res: Response<ResBlogs>) => {
  res.send(await blogsQueryRepository.getBlogs(req.query));
});

blogsRouter.get('/:id', async (req: Request<ParamBlog>, res: Response<ResBlog>) => {
  const blog = await blogsQueryRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.get(
  '/:id/posts',
  postsByBlogQueryValidation,
  async (req: Request<ParamBlog, {}, {}, Query>, res: Response<ResPosts>) => {
    const { id: blogId } = req.params;

    if (!blogId || !(await blogsQueryRepository.findBlogById(blogId))) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const posts = await postsStory.getPosts({ ...req.query, blogId }, req.requestContext.user?.id);

    if (posts) res.send(posts);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

blogsRouter.post('/', blogValidation, async (req: Request<{}, {}, ReqBodyBlog>, res: Response<ResBlog>) => {
  const newBlog = await blogsService.createBlog(req.body);

  res.status(HTTP_STATUSES.CREATED_201).send(newBlog);
});

blogsRouter.post(
  '/:id/posts',
  postByBlogIdValidation,
  async (req: Request<ParamBlog, {}, ReqBodyPostByBlogId>, res: Response<ResPost>) => {
    const { id: blogId } = req.params;

    if (!blogId || !(await blogsQueryRepository.findBlogById(blogId))) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const newPost = await postsService.createPost({ ...req.body, blogId });

    res.status(HTTP_STATUSES.CREATED_201).send(newPost);
  }
);

blogsRouter.put('/:id', blogValidation, async (req: Request<ParamBlog, {}, ReqBodyBlog>, res: Response<ResType>) => {
  const id = req.params.id;
  const isUpdated = await blogsService.updateBlog(id, req.body);

  if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.delete('/:id', checkBasicAuth, async (req: Request<ParamBlog>, res: Response<ResType>) => {
  const isDeleted = await blogsService.deleteBlog(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});
