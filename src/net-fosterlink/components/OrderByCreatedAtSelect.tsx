import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreatedAtOrderBy } from "../util/SortUtil";
import { cn } from "@/lib/utils";

type Props = {
  value: CreatedAtOrderBy;
  onValueChange: (value: CreatedAtOrderBy) => void;
  className?: string;
};

/**
 * Reusable "Order by: Newest first / Oldest first" select for lists sorted by createdAt.
 */
export function OrderByCreatedAtSelect({ value, onValueChange, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Select value={value} onValueChange={(v) => onValueChange(v as CreatedAtOrderBy)}>
        <SelectTrigger className="w-full sm:w-[140px] shrink-0">
          <SelectValue placeholder="Order by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
