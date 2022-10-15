import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

import { inputValidationMiddleware } from "../../../middlewares/input-validation";
import { checkAuth } from "../../../middlewares/check-auth";
import { blogsQueryRepository } from "../../blogs/repositories";

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

const blogIdValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const blog = await blogsQueryRepository.findBlogById(req.body.blogId.trim());

  if (!blog) (req as any).customError = { blogId: "Incorrect BlogId" };

  next();
};

export const postValidation = [
  checkAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidationMiddleware,
];

export { checkAuth };
