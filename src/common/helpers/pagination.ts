import { SortDirection } from '../types/common';

export const getSkipCount = (pageNumber: number, pageSize: number) => (pageNumber - 1) * pageSize;

export const getPagesCount = (totalCount: number, pageSize: number) => Math.ceil(totalCount / pageSize);

export const getSortDirectionNumber = (sortDirection: SortDirection) => (sortDirection === 'asc' ? 1 : -1);
