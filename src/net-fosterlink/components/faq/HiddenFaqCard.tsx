import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import type { HiddenFaqModel } from "@/net-fosterlink/backend/models/HiddenFaqModel";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { AlertCircleIcon } from "lucide-react";
import { BaseFaqCard } from "./BaseFaqCard";

interface HiddenFaqCardProps {
    faq: HiddenFaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    onRestore: (faq: HiddenFaqModel) => void;
    onDelete: (faq: HiddenFaqModel) => void;
}

export const HiddenFaqCard: React.FC<HiddenFaqCardProps> = ({
    faq,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    onRestore,
    onDelete,
}) => {
    const auth = useAuth();

    const statusBanner = (
        <Alert
            className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70"
            variant="destructive"
        >
            <AlertCircleIcon />
            <AlertTitle>Hidden by {faq.hiddenBy}</AlertTitle>
        </Alert>
    );

    const actionButtons = (
        <>
            <Button
                onClick={(e) => {
                    e.stopPropagation();
                    onRestore(faq);
                }}
                className="flex-1 min-w-0 text-sm text-green-700 hover:text-green-800 font-medium dark:text-green-300 dark:hover:text-green-200 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:hover:bg-emerald-500/30 rounded-none first:rounded-l-sm last:rounded-r-sm"
                variant="outline"
                disabled={auth.restricted}
            >
                Restore
            </Button>
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
};
