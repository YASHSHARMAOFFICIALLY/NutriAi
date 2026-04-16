export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const toOffset = ({ page, pageSize }: PaginationParams): number => (page - 1) * pageSize;

export const paginate = <T>(
  data: T[],
  total: number,
  { page, pageSize }: PaginationParams,
): Paginated<T> => ({
  data,
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});
