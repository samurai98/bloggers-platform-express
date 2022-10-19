import { HTTP_STATUSES } from "./http-statuses";

export type Pagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

/** Query after validation */
export type Query = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 1 | -1;
};

type ValueOf<T> = T[keyof T];

export type ResType<T = unknown> = T | ValueOf<typeof HTTP_STATUSES>;
