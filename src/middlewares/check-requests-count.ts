import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUSES } from '../common/http-statuses';
import { SETTINGS } from '../settings/config';

const ipList: Record<string, { firstRequestTime: number; requestsCount: number }> = {};

const MAX_COUNT_REQUESTS = SETTINGS.IS_RUN_TEST ? 30 : 5;
const LIMIT_SECONDS = SETTINGS.IS_RUN_TEST ? 99 : 10;

export const checkRequestsCount = async (req: Request, res: Response, next: NextFunction) => {
  const listKey = `${req.ip} ${req.path}`;
  const nowTime = new Date().getTime();
  const isLimitTimePassed = nowTime - ipList[listKey]?.firstRequestTime > LIMIT_SECONDS * 1000;

  if (!Object.keys(ipList).includes(listKey) || isLimitTimePassed) {
    ipList[listKey] = { firstRequestTime: nowTime, requestsCount: 1 };
    next();
    return;
  }

  if (ipList[listKey].requestsCount === MAX_COUNT_REQUESTS) {
    res.sendStatus(HTTP_STATUSES.MANY_REQUESTS_429);
    return;
  }

  ipList[listKey].requestsCount += 1;
  next();
};
