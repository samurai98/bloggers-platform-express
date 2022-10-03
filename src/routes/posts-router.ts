import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { inputValidationMiddleware } from "../middlewares/input-validation";
import { postsRepository } from "../repositories/posts-repository";

export const postsRouter = Router({});

const titleValidation = body("title")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("Title length error");

postsRouter.get("/", (req: Request, res: Response) => {
  const foundPosts = postsRepository.findPosts(
    req.query.title?.toString()
  );

  res.send(foundPosts);
});

postsRouter.get("/:id", (req: Request, res: Response) => {
  const post = postsRepository.findPostById(Number(req.params.id));

  if (post) res.send(post);
  else res.send(404);
});

postsRouter.post(
  "/",
  titleValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const newPost = postsRepository.createPost(req.body.title);
    res.status(201).send(newPost);
  }
);

postsRouter.put(
  "/:id",
  titleValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const isUpdated = postsRepository.updatePost(id, req.body.title);

    if (isUpdated) {
      const post = postsRepository.findPostById(id);
      res.send(post);
    } else res.send(404);
  }
);

postsRouter.delete("/:id", (req: Request, res: Response) => {
  const isDeleted = postsRepository.deletePost(Number(req.params.id));

  if (isDeleted) res.send(204);
  else res.send(404);
});
