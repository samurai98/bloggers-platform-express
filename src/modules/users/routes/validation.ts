import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

import {
  checkBasicAuth,
  getQueryValidation,
  inputValidation,
} from "middlewares";

import { usersQueryRepository } from "../repositories";

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

const loginAndPassValidation = body(["login", "password"])
  .trim()
  .notEmpty()
  .withMessage("Login or password incorrect");

const uniqueLoginAndEmailValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const login = req.body.login.trim() || "";
  const email = req.body.email.trim() || "";

  if (!login && !email) return next();

  const user = await usersQueryRepository.findByLoginAndEmail(login, email);

  if (user?.login === login)
    req.requestContext.validationErrors.login = "This login taken";

  if (user?.email === email)
    req.requestContext.validationErrors.email =
      "This email is already registered";

  next();
};

export const usersQueryValidation = getQueryValidation((query) => {
  const { searchEmailTerm, searchLoginTerm } = query;

  query.searchEmailTerm =
    typeof searchEmailTerm === "string" ? searchEmailTerm : "";
  query.searchLoginTerm =
    typeof searchLoginTerm === "string" ? searchLoginTerm : "";
});

export const authValidation = [loginAndPassValidation, inputValidation];

export const userValidation = [
  checkBasicAuth,
  loginValidation,
  emailValidation,
  passwordValidation,
  uniqueLoginAndEmailValidation,
  inputValidation,
];

export { checkBasicAuth };
