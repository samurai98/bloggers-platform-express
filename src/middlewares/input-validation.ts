import { Request, Response, NextFunction } from "express";
import { ValidationError, validationResult } from "express-validator";

export const inputValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorFormatter = ({ msg, param }: ValidationError) => ({
    field: param,
    message: msg,
  });

  const errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty())
    res.status(400).json({ errorsMessages: errors.array() });
  else next();
};
