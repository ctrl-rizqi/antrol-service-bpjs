
import { Request } from "express";

interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
  };
}

export async function paginate<T>(
  model: any,
  req: Request,
  findManyArgs: any = {}
): Promise<PaginationResult<T>> {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...findManyArgs,
      take: limit,
      skip: skip,
    }),
    model.count({ where: findManyArgs.where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return {
    data,
    meta: {
      total,
      limit,
      page,
      totalPages,
      prevPage,
      nextPage,
    },
  };
}
