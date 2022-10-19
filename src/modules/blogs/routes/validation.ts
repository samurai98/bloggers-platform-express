import { body } from "express-validator";

import {
  checkAuth,
  inputValidation,
  getQueryValidation,
} from "../../../middlewares";

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

export const blogsQueryValidation = getQueryValidation((query) => {
  const { searchNameTerm } = query;

  query.searchNameTerm =
    typeof searchNameTerm === "string" ? searchNameTerm : "";
});

export const postsByBlogQueryValidation = getQueryValidation();

export const blogValidation = [
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidation,
];

export { checkAuth };
