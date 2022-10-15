import { Query } from "../types";

export const getSkipCount = (pageNumber: number, pageSize: number) =>
  (pageNumber - 1) * pageSize;

export const getPagesCount = (totalCount: number, pageSize: number) =>
  Math.ceil(totalCount / pageSize);

export const getSortDirectionNumber = (sortBy: Query["sortDirection"]) =>
  sortBy === "asc" ? 1 : -1;
