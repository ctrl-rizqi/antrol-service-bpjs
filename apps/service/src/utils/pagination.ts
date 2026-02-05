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

// Type untuk Prisma Delegate
type PrismaDelegate<T, TArgs> = {
  findMany(args?: TArgs): Promise<T[]>;
  count(args?: {
    where?: TArgs extends { where: infer W } ? W : never;
  }): Promise<number>;
};

export async function paginate<
  T,
  TDelegate extends PrismaDelegate<T, any>,
  TArgs extends Parameters<TDelegate["findMany"]>[0],
>(
  model: TDelegate,
  req: Request,
  findManyArgs?: TArgs,
): Promise<PaginationResult<T>> {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...findManyArgs,
      take: limit,
      skip: skip,
    } as TArgs),
    model.count({
      where: findManyArgs?.where,
    }),
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
