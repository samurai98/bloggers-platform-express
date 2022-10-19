import { Router, Request, Response } from "express";

import { Query, ResType } from "common/types";
import { HTTP_STATUSES } from "common/http-statuses";
import { ResPost, ResPosts } from "modules/posts/post";
import { postsService } from "modules/posts/services/posts-service";
import { postsQueryRepository } from "modules/posts/repositories";
import { postByBlogIdValidation } from "modules/posts/routes/validation";

import { blogsService } from "../services/blogs-service";
import { blogsQueryRepository } from "../repositories";
import {
  ReqBodyBlog,
  ReqBodyPostByBlogId,
  ParamBlog,
  ReqQueryBlog,
  ResBlog,
  ResBlogs,
} from "../blog";
import {
  checkAuth,
  blogValidation,
  blogsQueryValidation,
  postsByBlogQueryValidation,
} from "./validation";

export const blogsRouter = Router({});

blogsRouter.get(
  "/",
  blogsQueryValidation,
  async (req: Request<{}, {}, {}, ReqQueryBlog>, res: Response<ResBlogs>) => {
    res.send(await blogsQueryRepository.getBlogs(req.query));
  }
);

blogsRouter.get("/:id", async (req: Request, res: Response<ResBlog>) => {
  const blog = await blogsQueryRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.get(
  "/:id/posts",
  postsByBlogQueryValidation,
  async (req: Request<ParamBlog, {}, {}, Query>, res: Response<ResPosts>) => {
    const { id: blogId } = req.params;

    if (!blogId || !(await blogsQueryRepository.findBlogById(blogId))) {
      res.send(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const posts = await postsQueryRepository.getPosts({ ...req.query, blogId });

    if (posts) res.send(posts);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);

blogsRouter.post(
  "/",
  blogValidation,
  async (req: Request<{}, {}, ReqBodyBlog>, res: Response<ResBlog>) => {
    const newBlog = await blogsService.createBlog(req.body);

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog);
  }
);

blogsRouter.post(
  "/:id/posts",
  postByBlogIdValidation,
  async (
    req: Request<ParamBlog, {}, ReqBodyPostByBlogId>,
    res: Response<ResPost>
  ) => {
    const { id: blogId } = req.params;

    if (!blogId || !(await blogsQueryRepository.findBlogById(blogId))) {
      res.send(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const newPost = await postsService.createPost({ ...req.body, blogId });

    res.status(HTTP_STATUSES.CREATED_201).send(newPost);
  }
);

blogsRouter.put(
  "/:id",
  blogValidation,
  async (req: Request<ParamBlog, {}, ReqBodyBlog>, res: Response<ResType>) => {
    const id = req.params.id;
    const isUpdated = await blogsService.updateBlog(id, req.body);

    if (isUpdated) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);

blogsRouter.delete(
  "/:id",
  checkAuth,
  async (req: Request<ParamBlog>, res: Response<ResType>) => {
    const isDeleted = await blogsService.deleteBlog(req.params.id);

    if (isDeleted) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);
