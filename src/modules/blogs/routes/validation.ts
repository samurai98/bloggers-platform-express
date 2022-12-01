import { body } from 'express-validator';

import { checkBearerAuth, inputValidation, getQueryValidation, checkUserRightsToEntity } from '../../../middlewares';
import { getErrorText, ERROR_TYPE } from '../../../common/messages';

const nameValidation = body('name')
  .trim()
  .notEmpty()
  .isLength({ max: 15 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'name', { max: 15 }));

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .isLength({ max: 500 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'description', { max: 500 }));

const websiteUrlValidation = body('websiteUrl')
  .trim()
  .notEmpty()
  .isURL()
  .withMessage(getErrorText(ERROR_TYPE.incorrect, 'websiteUrl'))
  .isLength({ max: 100 })
  .withMessage(getErrorText(ERROR_TYPE.length, 'websiteUrl', { max: 100 }));

export const blogsQueryValidation = getQueryValidation(query => {
  const { searchNameTerm } = query;

  query.searchNameTerm = typeof searchNameTerm === 'string' ? searchNameTerm : '';
});

export const postsByBlogQueryValidation = getQueryValidation();

const blogValidation = [nameValidation, websiteUrlValidation, descriptionValidation, inputValidation];

export const createBlogValidation = [checkBearerAuth, ...blogValidation];

export const updateBlogValidation = [checkBearerAuth, checkUserRightsToEntity('blog'), ...blogValidation];

export const deleteBlogValidation = [checkBearerAuth, checkUserRightsToEntity('blog')];
