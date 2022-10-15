import { Router, Request, Response } from "express";
import { blogsRepository } from "../../modules/blogs/repositories/blogs-repository";
import { postsRepository } from "../../modules/posts/repositories/posts-repository";
import { HTTP_STATUSES } from "../http-statuses";

export const deleteAllRouter = Router({});

deleteAllRouter.delete("/", async (req: Request, res: Response) => {
  await postsRepository.deleteAll();
  await blogsRepository.deleteAll();

  res.send(HTTP_STATUSES.NO_CONTENT_204);
});
