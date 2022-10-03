import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { checkAuth } from "../middlewares/check-auth";
import { inputValidationMiddleware } from "../middlewares/input-validation";
import { blogsRepository } from "../repositories/blogs-repository";
import { postsRepository } from "../repositories/posts-repository";

export const postsRouter = Router({});

const titleValidation = body("title")
  .trim()
  .notEmpty()
  .isLength({ max: 30 })
  .withMessage("Title length error");

const shortDescriptionValidation = body("shortDescription")
  .trim()
  .notEmpty()
  .isLength({ max: 100 })
  .withMessage("ShortDescription length error");

const contentValidation = body("content")
  .trim()
  .notEmpty()
  .isLength({ max: 1000 })
  .withMessage("Content length error");

const blogIdValidation = body("blogId")
  .trim()
  .notEmpty()
  .withMessage("BlogId error")
  .custom((value) => !!blogsRepository.findBlogById(value))
  .withMessage("Incorrect BlogId");

postsRouter.get("/", (req: Request, res: Response) => {
  res.send(postsRepository.getAllPosts());
});

postsRouter.get("/:id", (req: Request, res: Response) => {
  const post = postsRepository.findPostById(req.params.id);

  if (post) res.send(post);
  else res.send(404);
});

postsRouter.post(
  "/",
  checkAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const newPost = postsRepository.createPost(req.body);
    res.status(201).send(newPost);
  }
);

postsRouter.put(
  "/:id",
  checkAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const id = req.params.id;
    const isUpdated = postsRepository.updatePost(id, req.body);

    if (isUpdated) res.send(204);
    else res.send(404);
  }
);

postsRouter.delete("/:id", checkAuth, (req: Request, res: Response) => {
  const isDeleted = postsRepository.deletePost(req.params.id);

  if (isDeleted) res.send(204);
  else res.send(404);
});
