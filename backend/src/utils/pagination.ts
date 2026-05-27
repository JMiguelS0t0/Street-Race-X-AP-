import { Request } from 'express';

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const parsePagination = (req: Request, defaults?: { limit?: number; sort?: string }): PaginationParams => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || (defaults?.limit ?? 20);
  const skip = (page - 1) * limit;
  const sortField = (req.query.sort as string) || (defaults?.sort ?? 'created_at');
  const sortOrder: 'asc' | 'desc' = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
  return { page, limit, skip, sortField, sortOrder };
};

export const buildPaginationMeta = (total: number, page: number, limit: number): PaginationMeta => ({
  total, page, limit, totalPages: Math.ceil(total / limit)
});
