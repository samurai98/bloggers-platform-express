import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "../../../common/http-statuses";
import { ResType } from "../../../common/types";
import { blogsQueryRepository } from "../repositories";
import { blogsService } from "../services/blogs-service";
import {
  CreateBlog,
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
    res.send(await blogsQueryRepository.getAllBlogs(req.query));
  }
);

blogsRouter.get("/:id", async (req: Request, res: Response<ResponseBlog>) => {
  const blog = await blogsQueryRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});

blogsRouter.post(
  "/",
  blogValidation,
  async (req: Request<{}, {}, CreateBlog>, res: Response<ResponseBlog>) => {
    const newBlog = await blogsService.createBlog(req.body);
    res.status(HTTP_STATUSES.CREATED_201).send(newBlog);
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
