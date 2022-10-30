import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { inputValidation } from "middlewares";

import { usersQueryRepository } from "modules/users/repositories";

export const loginValidation = body("login")
  .trim()
  .notEmpty()
  .isLength({ min: 3, max: 10 })
  .withMessage("Login length error");

export const emailValidation = body("email")
  .trim()
  .notEmpty()
  .isEmail()
  .withMessage("Incorrect email");

export const passwordValidation = body("password")
  .trim()
  .notEmpty()
  .isLength({ min: 6, max: 20 })
  .withMessage("Password length error");

export const uniqueLoginAndEmailValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const login = req.body.login.trim() || "";
  const email = req.body.email.trim() || "";

  if (!login && !email) return next();

  const user = await usersQueryRepository.findUserByLoginAndEmail(login, email);

  if (user?.login === login)
    req.requestContext.validationErrors.login = "This login taken";

  if (user?.email === email)
    req.requestContext.validationErrors.email =
      "This email is already registered";

  next();
};

const loginAndPassValidation = body(["login", "password"])
  .trim()
  .notEmpty()
  .withMessage("Login or password incorrect");

const codeValidation = body("code")
  .trim()
  .notEmpty()
  .withMessage("Code incorrect");

export const registrationValidation = [
  loginValidation,
  emailValidation,
  passwordValidation,
  uniqueLoginAndEmailValidation,
  inputValidation,
];

export const confirmationValidation = [codeValidation, inputValidation];

export const resendingValidation = [emailValidation, inputValidation];

export const authValidation = [loginAndPassValidation, inputValidation];
