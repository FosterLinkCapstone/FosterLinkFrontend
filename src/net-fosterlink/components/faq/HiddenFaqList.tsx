import type { HiddenFaqModel } from "@/net-fosterlink/backend/models/HiddenFaqModel";
import { HiddenFaqCard } from "./HiddenFaqCard";
import { FaqCardSkeleton } from "./FaqCardSkeleton";

interface HiddenFaqListProps {
    faqs: HiddenFaqModel[];
    loading: boolean;
    error: string | null;
    expandedId: number | null;
    onExpand: (id: number) => void;
    onCollapse: () => void;
    onShowDetail: (faq: HiddenFaqModel) => void;
    onRestore: (faq: HiddenFaqModel) => void;
    onDelete: (faq: HiddenFaqModel) => void;
}

export const HiddenFaqList = ({
    faqs,
    loading,
    error,
    expandedId,
    onExpand,
    onCollapse,
    onShowDetail,
    onRestore,
    onDelete,
}: HiddenFaqListProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => <FaqCardSkeleton key={i} />)}
            </div>
        );
    }

    if (faqs.length === 0) {
        return (
            <>
                <p className="text-center text-muted-foreground py-12">No hidden FAQs found.</p>
                {error && <p className="text-center text-destructive">{error}</p>}
            </>
        );
    }

    return (
        <div className="space-y-4">
            {faqs.map((faq) => (
                <HiddenFaqCard
                    key={faq.id}
                    faq={faq}
                    onExpand={() => onExpand(faq.id)}
                    onCollapse={onCollapse}
                    onShowDetail={() => onShowDetail(faq)}
                    expanded={expandedId === faq.id}
                    onRestore={onRestore}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
