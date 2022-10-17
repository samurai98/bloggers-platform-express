import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "../../../common/http-statuses";
import { ResType } from "../../../common/types";
import {
  ReqBodyPost,
  ParamPost,
  ReqQueryPost,
  ResPost,
  ResPosts,
} from "../post";
import { postsQueryRepository } from "../repositories";
import { postsService } from "../services/posts-service";
import { postValidation, checkAuth } from "./validation";

export const postsRouter = Router({});

postsRouter.get(
  "/",
  async (req: Request<{}, {}, {}, ReqQueryPost>, res: Response<ResPosts>) => {
    res.send(await postsQueryRepository.getPosts(req.query));
  }
);

postsRouter.get("/:id", async (req: Request, res: Response<ResPost>) => {
  const post = await postsQueryRepository.findPostById(req.params.id);

  if (post) res.send(post);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.post(
  "/",
  postValidation,
  async (req: Request<{}, {}, ReqBodyPost>, res: Response<ResPost>) => {
    const newPost = await postsService.createPost(req.body);
    res.status(HTTP_STATUSES.CREATED_201).send(newPost);
  }
);

postsRouter.put(
  "/:id",
  postValidation,
  async (req: Request<ParamPost, {}, ReqBodyPost>, res: Response<ResType>) => {
    const id = req.params.id;
    const isUpdated = await postsService.updatePost(id, req.body);

    if (isUpdated) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);

postsRouter.delete(
  "/:id",
  checkAuth,
  async (req: Request<ParamPost>, res: Response<ResType>) => {
    const isDeleted = await postsService.deletePost(req.params.id);

    if (isDeleted) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);
