import { Request, Response, NextFunction } from "express";

import { getSortDirectionNumber } from "../common/helpers/pagination";

export const getQueryValidation =
  (callBackValidator?: (query: Request["query"]) => void) =>
  (req: Request<{}, {}, {}, any>, res: Response, next: NextFunction) => {
    const { pageNumber, pageSize, sortBy, sortDirection } = req.query;

    req.query.pageNumber =
      typeof pageNumber === "string" && Number(pageNumber)
        ? Number(pageNumber)
        : 1;

    req.query.pageSize =
      typeof pageSize === "string" && Number(pageSize) ? Number(pageSize) : 10;

    req.query.sortBy = typeof sortBy === "string" ? sortBy : "createdAt";

    req.query.sortDirection = getSortDirectionNumber(
      (sortDirection as unknown) === "asc" ? "asc" : "desc"
    );

    callBackValidator?.(req.query);

    next();
  };
