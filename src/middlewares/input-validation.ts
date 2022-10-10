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
  const errorsMessages = errors.array({ onlyFirstError: true });

  if ((req as any).customError) {
    Object.entries((req as any).customError).forEach(([key, value]) =>
      errorsMessages.push({ field: key, message: value })
    );
  }

  if (errorsMessages.length) res.status(400).json({ errorsMessages });
  else next();
};
