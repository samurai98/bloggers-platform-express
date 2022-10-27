import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

import {
  checkBasicAuth,
  getQueryValidation,
  inputValidation,
} from "middlewares";

import { blogsQueryRepository } from "modules/blogs/repositories";

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
  const blog = await blogsQueryRepository.findBlogById(req.body.blogId?.trim());

  if (!blog) req.requestContext.validationErrors.blogId = "Incorrect BlogId";

  next();
};

export const postsQueryValidation = getQueryValidation((query) => {
  const { blogId } = query;

  query.blogId = typeof blogId === "string" ? blogId : undefined;
});

export const postValidation = [
  checkBasicAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidation,
];

export const postByBlogIdValidation = [
  checkBasicAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidation,
];

export const commentsByPostQueryValidation = getQueryValidation();;

export { checkBasicAuth };
