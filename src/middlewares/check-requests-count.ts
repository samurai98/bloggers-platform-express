import { Request, Response, NextFunction } from "express";

import { HTTP_STATUSES } from "common/http-statuses";

const ipList: Record<
  string,
  { firstRequestTime: number; requestsCount: number }
> = {};

const MAX_COUNT_REQUESTS = 5;
const LIMIT_SECONDS = 7;

export const checkRequestsCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;
  const nowTime = new Date().getTime();
  const isLimitTimePassed =
    nowTime - ipList[ip]?.firstRequestTime > LIMIT_SECONDS * 1000;

  if (!Object.keys(ipList).includes(ip) || isLimitTimePassed) {
    ipList[ip] = { firstRequestTime: nowTime, requestsCount: 1 };
    next();
    return;
  }

  if (ipList[ip].requestsCount === MAX_COUNT_REQUESTS) {
    res.sendStatus(HTTP_STATUSES.MANY_REQUESTS_429);
    return;
  }

  ipList[ip].requestsCount += 1;
  next();
};
