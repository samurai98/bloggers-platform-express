import { Request, Response, NextFunction } from "express";

const checkBasicAuthorization = (value?: string) =>
  value === "Basic YWRtaW46cXdlcnR5";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const isAuth = checkBasicAuthorization(req.headers.authorization);

  if (!isAuth) res.sendStatus(401);
  else next();
};
