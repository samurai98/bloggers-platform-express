import { Pagination, SortDirection } from "../../src/common/types";
import { getSortDirectionNumber } from "../../src/common/helpers/pagination";

import { bearerAuth } from "./data";

export const dateISORegEx = expect.stringMatching(
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
);

export const anyString = expect.any(String);

export const getErrorsMessages = <T>(...fields: (keyof T)[]) => ({
  errorsMessages: expect.arrayContaining(
    fields.map((field) => ({
      field,
      message: anyString,
    }))
  ),
});

export const getOverMaxLength = (max: number) => "a".repeat(max + 1);

export const sortByField = <T = any[]>(
  arr: T[],
  field: keyof T,
  sortDirection: SortDirection = "desc"
) => {
  const sortNum = getSortDirectionNumber(sortDirection);

  return [...arr].sort((a, b) => {
    if (a[field] > b[field]) return sortNum;
    if (a[field] < b[field]) return sortNum === 1 ? -1 : 1;
    else return 0;
  });
};

export const getPaginationItems = ({
  pagesCount = 0,
  page = 1,
  pageSize = 10,
  totalCount = 0,
  items = [],
}: Partial<Pagination> = {}): Pagination => ({
  pagesCount,
  page,
  pageSize,
  totalCount,
  items,
});

export const setBearerAuth = (token: string, cookie: string) => {
  bearerAuth.Authorization = `Bearer ${token}`;
  bearerAuth.Cookie = cookie;
};
