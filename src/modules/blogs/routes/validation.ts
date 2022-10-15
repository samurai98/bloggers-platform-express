import { body } from "express-validator";

import { inputValidationMiddleware } from "../../../middlewares/input-validation";
import { checkAuth } from "../../../middlewares/check-auth";

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

export const blogValidation = [
  checkAuth,
  nameValidation,
  youtubeUrlValidation,
  inputValidationMiddleware,
];

export { checkAuth };
