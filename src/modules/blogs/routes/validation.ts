import { body } from 'express-validator';

import { checkBasicAuth, inputValidation, getQueryValidation } from '../../../middlewares';

const nameValidation = body('name').trim().notEmpty().isLength({ max: 15 }).withMessage('Name length error');

const descriptionValidation = body('description')
  .trim()
  .notEmpty()
  .isLength({ max: 500 })
  .withMessage('Description length error');

const websiteUrlValidation = body('websiteUrl')
  .trim()
  .notEmpty()
  .isURL()
  .withMessage('WebsiteUrl incorrect')
  .isLength({ max: 100 })
  .withMessage('WebsiteUrl length error');

export const blogsQueryValidation = getQueryValidation(query => {
  const { searchNameTerm } = query;

  query.searchNameTerm = typeof searchNameTerm === 'string' ? searchNameTerm : '';
});

export const postsByBlogQueryValidation = getQueryValidation();

export const blogValidation = [
  checkBasicAuth,
  nameValidation,
  websiteUrlValidation,
  descriptionValidation,
  inputValidation,
];

export { checkBasicAuth };
