import { body } from "express-validator";

import { checkAuth } from "../../../middlewares/check-auth";
import { inputValidationMiddleware } from "../../../middlewares/input-validation";

const loginValidation = body("login")
  .trim()
  .notEmpty()
  .isLength({ min: 3, max: 10 })
  .withMessage("Login length error");

const emailValidation = body("email")
  .trim()
  .notEmpty()
  .isEmail()
  .withMessage("Incorrect email");

const passwordValidation = body("password")
  .trim()
  .notEmpty()
  .isLength({ min: 6, max: 20 })
  .withMessage("Password length error");

const uniqueEmailValidation = async () => {};

export const userQueryValidation = [];

export const authValidation = body(["loginOrEmail", "password"])
  .trim()
  .notEmpty()
  .withMessage("Login or password incorrect");

export const userValidation = [
  checkAuth,
  loginValidation,
  emailValidation,
  passwordValidation,
  inputValidationMiddleware,
];

export { checkAuth };
