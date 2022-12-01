import { Router, Request, Response } from 'express';

import { Query, ParamId, ResType } from '../../../common/types/common';
import { HTTP_STATUSES } from '../../../common/http-statuses';
import { ResPost, ResPosts } from '../../posts/post';
import { postByBlogIdValidation } from '../../posts/routes/validation';

import { blogsService } from '../services/blogs-service';
import { ReqBodyBlog, ReqBodyPostByBlogId, ReqQueryBlog, ResBlog, ResBlogs } from '../blog';
import { createBlogValidation, updateBlogValidation, blogsQueryValidation, postsByBlogQueryValidation, deleteBlogValidation } from './validation';

export const blogsRouter = Router({});

blogsRouter.get('/', blogsQueryValidation, async (req: Request<{}, {}, {}, ReqQueryBlog>, res: Response<ResBlogs>) => {
  res.send(await blogsService.getBlogs(req.query));
});

blogsRouter.get('/:id', async (req: Request<ParamId>, res: Response<ResBlog>) => {
  const blog = await blogsService.getBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.post('/', createBlogValidation, async (req: Request<{}, {}, ReqBodyBlog>, res: Response<ResBlog>) => {
  const newBlog = await blogsService.createBlog({ ...req.body, userId: req.requestContext.user!.id });

  res.status(HTTP_STATUSES.CREATED_201).send(newBlog);
});

blogsRouter.put('/:id', updateBlogValidation, async (req: Request<ParamId, {}, ReqBodyBlog>, res: Response<ResType>) => {
  const isUpdated = await blogsService.updateBlog(req.params.id, req.body);

  if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.delete('/:id', deleteBlogValidation, async (req: Request<ParamId>, res: Response<ResType>) => {
  const isDeleted = await blogsService.deleteBlog(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.get(
  '/:id/posts',
  postsByBlogQueryValidation,
  async (req: Request<ParamId, {}, {}, Query>, res: Response<ResPosts>) => {
    const { params, requestContext, query } = req;
    const posts = await blogsService.getPostsByBlogId(params.id, requestContext.user?.id, query);

    if (posts) res.send(posts);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

blogsRouter.post(
  '/:id/posts',
  postByBlogIdValidation,
  async (req: Request<ParamId, {}, ReqBodyPostByBlogId>, res: Response<ResPost>) => {
    const { params, requestContext, body } = req;
    const post = await blogsService.createPostByBlogId(params.id, requestContext.user!.id, body);

    if (post) res.status(HTTP_STATUSES.CREATED_201).send(post);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);
