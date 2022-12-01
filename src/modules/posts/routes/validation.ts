import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { checkBearerAuth, checkUserRightsToEntity, getQueryValidation, inputValidation } from '../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';
import { HTTP_STATUSES } from '../../../common/http-statuses';

import { blogsService } from '../../blogs/services/blogs-service';

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
  const blog = await blogsService.getBlogDBbyId(req.body.blogId?.trim());

  if (blog && blog.userId !== req.requestContext.user?.id) {
    res.sendStatus(HTTP_STATUSES.FORBIDDEN_403);
    return;
  }

  if (!blog) req.requestContext.validationErrors.blogId = getErrorText(ERROR_TYPE.incorrect, 'blogId');

  next();
};

export const postsQueryValidation = getQueryValidation(query => {
  const { blogId } = query;

  query.blogId = typeof blogId === 'string' ? blogId : undefined;
});

const postValidation = [titleValidation, shortDescriptionValidation, contentValidation];

export const createPostValidation = [checkBearerAuth, blogIdValidation, ...postValidation, inputValidation];

export const updatePostValidation = [
  checkBearerAuth,
  blogIdValidation,
  checkUserRightsToEntity('post'),
  ...postValidation,
  inputValidation,
];

export const postByBlogIdValidation = [
  checkBearerAuth,
  checkUserRightsToEntity('blog'),
  ...postValidation,
  inputValidation,
];

export const commentsByPostQueryValidation = getQueryValidation();

export const deletePostValidation = [checkBearerAuth, checkUserRightsToEntity('post')];
