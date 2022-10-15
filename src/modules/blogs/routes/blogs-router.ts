import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "../../../common/http-statuses";
import { Query, ResType } from "../../../common/types";
import { ResponsePost, ResponsePosts } from "../../posts/post";
import { postByBlogIdValidation } from "../../posts/routes/validation";
import { postsQueryRepository } from "../../posts/repositories";
import { postsService } from "../../posts/services/posts-service";
import { blogsQueryRepository } from "../repositories";
import { blogsService } from "../services/blogs-service";
import {
  CreateBlog,
  CreatePostByBlogId,
  ParamBlog,
  QueryBlog,
  ResponseBlog,
  ResponseBlogs,
} from "../blog";
import { blogValidation, checkAuth } from "./validation";

export const blogsRouter = Router({});

blogsRouter.get(
  "/",
  async (req: Request<{}, {}, {}, QueryBlog>, res: Response<ResponseBlogs>) => {
    res.send(await blogsQueryRepository.getBlogs(req.query));
  }
);

blogsRouter.get("/:id", async (req: Request, res: Response<ResponseBlog>) => {
  const blog = await blogsQueryRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.get(
  "/:id/posts",
  async (
    req: Request<ParamBlog, {}, {}, Query>,
    res: Response<ResponsePosts>
  ) => {
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
  async (req: Request<{}, {}, CreateBlog>, res: Response<ResponseBlog>) => {
    const newBlog = await blogsService.createBlog(req.body);

    res.status(HTTP_STATUSES.CREATED_201).send(newBlog);
  }
);

blogsRouter.post(
  "/:id/posts",
  postByBlogIdValidation,
  async (
    req: Request<ParamBlog, {}, CreatePostByBlogId>,
    res: Response<ResponsePost>
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
  async (req: Request<ParamBlog, {}, CreateBlog>, res: Response<ResType>) => {
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
