import { HTTP_STATUSES } from "common/http-statuses";
import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

import { checkBearerAuth, inputValidation } from "middlewares";

import { commentsQueryRepository } from "../repositories";

const contentValidation = body("content")
  .trim()
  .notEmpty()
  .isLength({ min: 20, max: 300 })
  .withMessage("Content length error");

const checkUserRights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const comment = await commentsQueryRepository.findCommentById(
    req.params.commentId
  );

  if (!comment) {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    return;
  }

  if (comment.userId !== req.requestContext.user?.id) {
    res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
  } else next();
};

export const updateCommentValidation = [
  checkBearerAuth,
  checkUserRights,
  contentValidation,
  inputValidation,
];

export const deleteCommentValidation = [checkBearerAuth, checkUserRights];

export const commentByPostIdValidation = [
  checkBearerAuth,
  contentValidation,
  inputValidation,
];
