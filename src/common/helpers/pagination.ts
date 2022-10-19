export const getSkipCount = (pageNumber: number, pageSize: number) =>
  (pageNumber - 1) * pageSize;

export const getPagesCount = (totalCount: number, pageSize: number) =>
  Math.ceil(totalCount / pageSize);

export const getSortDirectionNumber = (sortBy: "asc" | "desc") =>
  sortBy === "asc" ? 1 : -1;
