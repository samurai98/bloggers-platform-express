import { Request, Response, NextFunction } from 'express';

import { getSortDirectionNumber } from '../common/helpers/pagination';

export const getQueryValidation =
  (callBackValidator?: (query: Request['query']) => void) =>
  (req: Request<{}, {}, {}, any>, res: Response, next: NextFunction) => {
    const { pageNumber, pageSize, sortBy, sortDirection } = req.query;
    const pageNumberNum = Number(pageNumber);
    const pageSizeNum = Number(pageSize);

    req.query.pageNumber = typeof pageNumber === 'string' && pageNumberNum && pageNumberNum !== 0 ? pageNumberNum : 1;

    req.query.pageSize = typeof pageSize === 'string' && pageSizeNum && pageSizeNum !== 0 ? pageSizeNum : 10;

    req.query.sortBy = typeof sortBy === 'string' && sortBy ? sortBy : 'createdAt';

    req.query.sortDirection = getSortDirectionNumber((sortDirection as unknown) === 'asc' ? 'asc' : 'desc');

    callBackValidator?.(req.query);

    next();
  };
