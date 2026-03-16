import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { ApprovalStatus, type PendingFaqModel } from "@/net-fosterlink/backend/models/PendingFaqModel";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { AlertCircleIcon } from "lucide-react";
import { BaseFaqCard } from "./BaseFaqCard";

interface PendingFaqCardProps {
    faq: PendingFaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    onApprove: (faq: PendingFaqModel) => void;
    onDeny: (faq: PendingFaqModel) => void;
    onDelete: (faq: PendingFaqModel) => void;
}

export const PendingFaqCard = memo<PendingFaqCardProps>(({
    faq,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    onApprove,
    onDeny,
    onDelete,
}) => {
    const auth = useAuth();

    const statusBanner = faq.approvalStatus === ApprovalStatus.DENIED ? (
        <Alert
            className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70"
            variant="destructive"
        >
            <AlertCircleIcon />
            <AlertTitle>Denied by {faq.deniedByUsername}</AlertTitle>
        </Alert>
    ) : undefined;

    const actionButtons = (
        <>
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    onApprove(faq);
                }}
                className="flex-1 min-w-0 text-sm text-green-700 hover:text-green-800 font-medium dark:text-green-300 dark:hover:text-green-200 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:hover:bg-emerald-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                variant="outline"
                disabled={auth.restricted}
            >
                Approve
            </Button>
            {faq.approvalStatus !== ApprovalStatus.DENIED && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeny(faq);
                    }}
                    className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                    variant="outline"
                    disabled={auth.restricted}
                >
                    Deny
                </Button>
            )}
            {faq.approvalStatus === ApprovalStatus.DENIED && (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(faq);
                    }}
                    className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                    variant="outline"
                    disabled={auth.restricted}
                >
                    Delete
                </Button>
            )}
        </>
    );

    return (
        <BaseFaqCard
            faq={faq}
            onExpand={onExpand}
            onCollapse={onCollapse}
            onShowDetail={onShowDetail}
            expanded={expanded}
            statusBanner={statusBanner}
            actionButtons={actionButtons}
        />
    );
});
