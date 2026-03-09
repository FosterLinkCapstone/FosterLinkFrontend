import { Badge } from "@/components/ui/badge";
import type { AdminFaqForUserModel } from "@/net-fosterlink/backend/models/AdminFaqForUserModel";
import { BaseFaqCard } from "./BaseFaqCard";

interface AdminFaqAnswerCardProps {
    item: AdminFaqForUserModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    contentLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700",
    DENIED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700",
    HIDDEN: "bg-muted text-muted-foreground border-border",
};

export const AdminFaqAnswerCard: React.FC<AdminFaqAnswerCardProps> = ({
    item,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    contentLoading,
}) => {
    const statusClass = STATUS_COLORS[item.entityStatus] ?? "bg-muted text-muted-foreground border-border";
    const statusLabel = item.hiddenByAuthor && item.entityStatus === "HIDDEN"
        ? "Hidden by author"
        : item.entityStatus;

    const statusBanner = (
        <div className="mb-1 w-full">
            <Badge variant="outline" className={`block w-full text-center text-xs font-medium py-1.5 ${statusClass}`}>
                {statusLabel}
            </Badge>
        </div>
    );

    return (
        <BaseFaqCard
            faq={item.faq}
            onExpand={onExpand}
            onCollapse={onCollapse}
            onShowDetail={onShowDetail}
            expanded={expanded}
            contentLoading={contentLoading}
            statusBanner={statusBanner}
        />
    );
};
