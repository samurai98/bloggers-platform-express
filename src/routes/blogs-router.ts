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
  .isLength({ max: 100 })
  .withMessage("YoutubeUrl length error");

blogsRouter.get("/", async (req: Request, res: Response) => {
  res.send(await blogsRepository.getAllBlogs());
});

blogsRouter.get("/:id", async (req: Request, res: Response) => {
  const blog = await blogsRepository.findBlogById(req.params.id);

  if (blog) res.send(blog);
  else res.send(404);
});

blogsRouter.post(
  "/",
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const newBlog = await blogsRepository.createBlog(req.body);
    res.status(201).send(newBlog);
  }
);

blogsRouter.put(
  "/:id",
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const isUpdated = await blogsRepository.updateBlog(id, req.body);

    if (isUpdated) res.send(204);
    else res.send(404);
  }
);

blogsRouter.delete("/:id", checkAuth, async (req: Request, res: Response) => {
  const isDeleted = await blogsRepository.deleteBlog(req.params.id);

  if (isDeleted) res.send(204);
  else res.send(404);
});
