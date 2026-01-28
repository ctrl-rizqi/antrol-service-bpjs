export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_VALIDATION_HISTORY_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

export const ensureString = (
  value: string | string[] | undefined,
): string | null => {
  if (!value || Array.isArray(value)) return null;
  return value.trim() === "" ? null : value;
};

export const validatePaginationParams = (
  page?: string | string[],
  pageSize?: string | string[],
  defaultSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
) => {
  const pageStr = Array.isArray(page) ? page[0] : page;
  const pageSizeStr = Array.isArray(pageSize) ? pageSize[0] : pageSize;

  const parsedPage = Math.max(1, parseInt(pageStr || "1", 10) || 1);
  const parsedPageSize = Math.min(
    PAGINATION_CONFIG.MAX_PAGE_SIZE,
    Math.max(
      1,
      parseInt(pageSizeStr || String(defaultSize), 10) || defaultSize,
    ),
  );

  return {
    page: parsedPageSize <= 0 ? 1 : parsedPage,
    pageSize: parsedPageSize,
    skip: (parsedPage - 1) * parsedPageSize,
  };
};
