import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { checkAuth } from "../middlewares/check-auth";
import { inputValidationMiddleware } from "../middlewares/input-validation";
import { blogsRepository } from "../repositories/blogs-repository";

export const blogsRouter = Router({});

const nameValidation = body("name")
  .trim()
  .notEmpty()
  .isLength({ max: 15 })
  .withMessage("Name length error");

const youtubeUrlValidation = body("youtubeUrl")
  .trim()
  .notEmpty()
  .isURL()
  .withMessage("YoutubeUrl incorrect")
  .bail()
  .isLength({ max: 100 })
  .withMessage("YoutubeUrl length error");

blogsRouter.get("/", (req: Request, res: Response) => {
  res.send(blogsRepository.getAllBlogs());
});

blogsRouter.get("/:id", (req: Request, res: Response) => {
  const blog = blogsRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.send(404);
});

blogsRouter.post(
  "/",
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const newBlog = blogsRepository.createBlog(req.body);
    res.status(201).send(newBlog);
  }
);

blogsRouter.put(
  "/:id",
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const id = req.params.id;
    const isUpdated = blogsRepository.updateBlog(id, req.body);

    if (isUpdated) res.send(204);
    else res.send(404);
  }
);

blogsRouter.delete("/:id", checkAuth, (req: Request, res: Response) => {
  const isDeleted = blogsRepository.deleteBlog(req.params.id);

  if (isDeleted) res.send(204);
  else res.send(404);
});
