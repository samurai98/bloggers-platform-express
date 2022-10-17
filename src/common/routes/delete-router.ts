import { Router, Request, Response } from "express";

import { blogsRepository } from "../../modules/blogs/repositories";
import { postsRepository } from "../../modules/posts/repositories";
import { usersRepository } from "../../modules/users/repositories";
import { HTTP_STATUSES } from "../http-statuses";

export const deleteAllRouter = Router({});

deleteAllRouter.delete("/", async (req: Request, res: Response) => {
  await postsRepository.deleteAll();
  await blogsRepository.deleteAll();
  await usersRepository.deleteAll();

  res.send(HTTP_STATUSES.NO_CONTENT_204);
});
