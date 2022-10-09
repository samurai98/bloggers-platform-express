import { Router, Request, Response } from "express";
import { blogsRepository } from "../repositories/blogs-repository";
import { postsRepository } from "../repositories/posts-repository";

export const deleteAllRouter = Router({});

deleteAllRouter.delete("/", async (req: Request, res: Response) => {
  await postsRepository.deleteAll();
  await blogsRepository.deleteAll();

  res.send(204);
});
