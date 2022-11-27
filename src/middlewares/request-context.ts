import { Request, Response, NextFunction } from 'express';

import { User } from '../modules/users/user';

type RequestContext = {
  user?: User;
  validationErrors: Record<string, string>;
};

declare global {
  namespace Express {
    interface Request {
      requestContext: RequestContext;
    }
  }
}

export const addRequestContext = () => (req: Request, res: Response, next: NextFunction) => {
  req.requestContext = {} as RequestContext;
  req.requestContext.validationErrors = {};

  next();
};
