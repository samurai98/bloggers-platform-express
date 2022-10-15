import { HTTP_STATUSES } from "./http-statuses";

export type Pagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export type Query = Partial<{
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
}>;

type ValueOf<T> = T[keyof T];

export type ResType<T = unknown> = T | ValueOf<typeof HTTP_STATUSES>;
