import { Request, Response, NextFunction } from "express";
import { ValidationError, validationResult } from "express-validator";

import { HTTP_STATUSES } from "common/http-statuses";

const errorFormatter = ({ msg, param }: ValidationError) => ({
  field: param,
  message: msg,
});

export const inputValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  const errorsMessages = errors.array({ onlyFirstError: true });
  const { validationErrors } = req.requestContext;

  if (Object.keys(validationErrors).length) {
    Object.entries(validationErrors).forEach(([key, value]) =>
      errorsMessages.push({ field: key, message: value })
    );
  }

  if (errorsMessages.length)
    res.status(HTTP_STATUSES.BAD_REQUEST_400).json({ errorsMessages });
  else next();
};
