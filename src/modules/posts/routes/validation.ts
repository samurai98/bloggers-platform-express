import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { checkBearerAuth, getQueryValidation, inputValidation } from '../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

import { blogsQueryRepository } from '../../blogs/repositories';

const titleValidation = body('title')
  .trim()
  .notEmpty()
  .isLength({ max: 30 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'title', { max: 30 }));

const shortDescriptionValidation = body('shortDescription')
  .trim()
  .notEmpty()
  .isLength({ max: 100 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'shortDescription', { max: 100 }));

const contentValidation = body('content')
  .trim()
  .notEmpty()
  .isLength({ max: 1000 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'content', { max: 1000 }));

const blogIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const blog = await blogsQueryRepository.findBlogById(req.body.blogId?.trim());

  if (!blog) req.requestContext.validationErrors.blogId = getErrorText(ERROR_TYPE.incorrect, 'blogId');

  next();
};

export const postsQueryValidation = getQueryValidation(query => {
  const { blogId } = query;

  query.blogId = typeof blogId === 'string' ? blogId : undefined;
});

export const postValidation = [
  checkBearerAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
  inputValidation,
];

export const postByBlogIdValidation = [
  checkBearerAuth,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidation,
];

export const commentsByPostQueryValidation = getQueryValidation();

export { checkBearerAuth };
