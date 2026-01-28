export const validateBigInt = (
  value: string | string[] | undefined,
): bigint | null => {
  if (!value || Array.isArray(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};
