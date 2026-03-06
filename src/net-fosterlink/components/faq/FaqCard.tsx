import { Button } from "@/components/ui/button";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { FaqModel } from "@/net-fosterlink/backend/models/FaqModel";
import { BaseFaqCard } from "./BaseFaqCard";

interface FaqCardProps {
    faq: FaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    contentLoading?: boolean;
    canEdit: boolean;
    onRemove: (id: number) => void;
}

export const FaqCard: React.FC<FaqCardProps> = ({ faq, onExpand, onCollapse, onShowDetail, expanded, contentLoading, canEdit, onRemove }) => {
    const auth = useAuth();

    const actionButtons = canEdit ? (
        <Button
            onClick={(e) => {
                e.stopPropagation();
                onRemove(faq.id);
            }}
            className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
            variant="outline"
            disabled={auth.restricted}
        >
            {auth.admin ? "Hide" : "Delete"}
        </Button>
    ) : undefined;

    return (
        <BaseFaqCard
            faq={faq}
            onExpand={onExpand}
            onCollapse={onCollapse}
            onShowDetail={onShowDetail}
            expanded={expanded}
            contentLoading={contentLoading}
            actionButtons={actionButtons}
        />
    );
};
