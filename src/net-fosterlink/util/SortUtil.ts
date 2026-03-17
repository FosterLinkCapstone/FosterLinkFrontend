/**
 * Shared type for ordering lists by creation date (newest first or oldest first).
 * Use with sortByCreatedAt() and OrderByCreatedAtSelect.
 */
export type CreatedAtOrderBy = "newest" | "oldest";

/** Item that has a creation date (and optionally updated date for fallback). */
export type WithCreatedAt = {
  createdAt?: string | Date | number | null;
  updatedAt?: string | Date | number | null;
};

/**
 * Sorts an array by createdAt (or optional updatedAt fallback) according to orderBy.
 * Does not mutate the original array.
 *
 * @param items - Array of items with at least createdAt or updatedAt
 * @param orderBy - "newest" (desc) or "oldest" (asc)
 * @param getDate - Optional getter for the sort date; default uses item.createdAt ?? item.updatedAt ?? 0
 */
export function sortByCreatedAt<T>(
  items: T[],
  orderBy: CreatedAtOrderBy,
  getDate?: (item: T) => string | Date | number | null | undefined
): T[] {
  const resolved = [...items];
  const getTime = getDate ?? defaultGetCreatedAt;
  resolved.sort((a, b) => {
    const aTime = new Date(getTime(a) ?? 0).getTime();
    const bTime = new Date(getTime(b) ?? 0).getTime();
    return orderBy === "newest" ? bTime - aTime : aTime - bTime;
  });
  return resolved;
}

function defaultGetCreatedAt(item: unknown): string | Date | number | null | undefined {
  const o = item as WithCreatedAt;
  return o.createdAt ?? o.updatedAt ?? null;
}
