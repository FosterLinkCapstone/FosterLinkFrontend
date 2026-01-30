import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_PAGES = 5;

export type PaginatorProps<T> = {
  pageCount: number;
  currentPage: number;
  setCurrentPage: (n: number) => void;
  onPageChanged: (pageNum: number) => Promise<T>;
  onDataChanged: (data: T) => void;
};

export function Paginator<T>({
  pageCount,
  onDataChanged,
  onPageChanged,
  currentPage,
  setCurrentPage
}: PaginatorProps<T>) {
  const [loading, setLoading] = useState(false);

  if (pageCount <= 1) {
    return null;
  }

  const goToPage = async (pageNum: number) => {
    if (pageNum < 1 || pageNum > pageCount) return;
    if (onPageChanged && onDataChanged) {
      setLoading(true);
      try {
        const data = await onPageChanged(pageNum);
        onDataChanged(data);
        setCurrentPage(pageNum);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentPage(pageNum);
    }
  };

  const prevPage = () => goToPage(currentPage - 1);
  const nextPage = () => goToPage(currentPage + 1);

  const pageNumbers = ((): number[] => {
    if (pageCount <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }
    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(pageCount, start + MAX_VISIBLE_PAGES - 1);
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 py-6"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={prevPage}
        disabled={currentPage <= 1 || loading}
        aria-label="Previous page"
      >
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers[0] > 1 && (
          <>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(1)}
              disabled={loading}
              aria-label="Page 1"
            >
              1
            </Button>
            {pageNumbers[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
          </>
        )}
        {pageNumbers.map((num) => (
          <Button
            key={num}
            variant={currentPage === num ? "default" : "outline"}
            size="icon"
            className={cn("h-8 w-8", currentPage === num && "pointer-events-none")}
            onClick={() => goToPage(num)}
            disabled={loading}
            aria-label={`Page ${num}`}
            aria-current={currentPage === num ? "page" : undefined}
          >
            {num}
          </Button>
        ))}
        {pageNumbers[pageNumbers.length - 1] < pageCount && (
          <>
            {pageNumbers[pageNumbers.length - 1] < pageCount - 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              variant={currentPage === pageCount ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(pageCount)}
              disabled={loading}
              aria-label={`Page ${pageCount}`}
            >
              {pageCount}
            </Button>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={nextPage}
        disabled={currentPage >= pageCount || loading}
        aria-label="Next page"
      >
        Next
      </Button>

      <span className="text-muted-foreground text-sm ml-1">
        Page {currentPage} of {pageCount}
      </span>
    </nav>
  );
}
