import { Request, Response, NextFunction } from "express";

const checkAuthorization = (value?: string) =>
  value === "Basic YWRtaW46cXdlcnR5";

export const checkBasicAuth = (req: Request, res: Response, next: NextFunction) => {
  const isAuth = checkAuthorization(req.headers.authorization);

  if (!isAuth) res.sendStatus(401);
  else next();
};
