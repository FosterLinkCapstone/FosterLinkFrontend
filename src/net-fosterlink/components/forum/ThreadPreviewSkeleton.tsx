import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ThreadPreviewSkeleton = () => (
  <Card className="flex overflow-hidden border border-border">
    <div className="flex flex-col items-center mx-6 py-2 rounded-md bg-muted min-w-[180px]">
      <Skeleton className="h-16 w-16 rounded-full mb-3" />
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-3 w-14" />
    </div>

    <div className="flex-1 px-6 flex flex-col">
      <Skeleton className="h-6 w-3/4 max-w-md mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-4" />

      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <div className="flex items-start gap-2 flex-wrap flex-col">
          <Skeleton className="h-3 w-32" />
          <div className="flex flex-row gap-2 items-center">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-5 w-6" />
        </div>
      </div>
    </div>
  </Card>
);
