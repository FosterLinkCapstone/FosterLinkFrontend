import { Button } from "@/components/ui/button";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import type { FaqModel } from "@/net-fosterlink/backend/models/FaqModel";
import { BaseFaqCard } from "./BaseFaqCard";
import { EditFaqContentDialog } from "./EditFaqContentDialog";
import { faqApi } from "@/net-fosterlink/backend/api/FaqApi";
import { confirm } from "@/net-fosterlink/components/ConfirmDialog";
import { useState, useEffect } from "react";

interface FaqCardProps {
    faq: FaqModel;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    contentLoading?: boolean;
    /** When true, the author can edit title/summary/content (Edit button and edit mode). */
    canEdit: boolean;
    /** When true, the user can hide/delete this FAQ (author or admin). */
    canRemove: boolean;
    onRemove: (id: number) => void;
    /** When set, admin can permanently delete (in addition to hide). */
    onDelete?: (id: number) => void;
    /** Current content when user has opened "Click for more!" for this FAQ (for pre-filling edit dialog) */
    contentForFaq?: string | null;
    onSentToPending?: (faqId: number) => void;
}

export const FaqCard: React.FC<FaqCardProps> = ({
    faq,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    contentLoading,
    canEdit,
    canRemove,
    onRemove,
    onDelete,
    contentForFaq,
    onSentToPending,
}) => {
    const auth = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [draftTitle, setDraftTitle] = useState(faq.title);
    const [draftSummary, setDraftSummary] = useState(faq.summary);
    const [draftContent, setDraftContent] = useState<string | null>(null);
    const [contentDialogOpen, setContentDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setDraftTitle(faq.title);
        setDraftSummary(faq.summary);
        setDraftContent(null);
    }, [faq.id]);

    useEffect(() => {
        if (!expanded) setEditMode(false);
    }, [expanded]);

    const hasChanges =
        draftTitle !== faq.title || draftSummary !== faq.summary || draftContent !== null;

    const handleReset = () => {
        setDraftTitle(faq.title);
        setDraftSummary(faq.summary);
        setDraftContent(null);
        setEditMode(false);
    };

    const handleSave = async () => {
        const ok = await confirm({
            message:
                "Saving your changes will send this FAQ back to pending approval. An administrator will need to approve it again before it appears on the public list. Do you want to continue?",
        });
        if (!ok) return;
        setSaving(true);
        const api = faqApi(auth);
        const payload: { title?: string; summary?: string; content?: string } = {};
        if (draftTitle !== faq.title) payload.title = draftTitle;
        if (draftSummary !== faq.summary) payload.summary = draftSummary;
        if (draftContent !== null) payload.content = draftContent;
        const res = await api.update(faq.id, payload);
        setSaving(false);
        if (!res.isError) {
            onSentToPending?.(faq.id);
        }
    };

    const handleSaveDraftContent = (content: string) => {
        setDraftContent(content);
        setContentDialogOpen(false);
    };

    const actionButtons = canRemove ? (
        <>
            {auth.admin ? (
                <>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(faq.id);
                        }}
                        className="flex-1 min-w-0 text-sm text-amber-700 hover:text-amber-800 font-medium dark:text-amber-300 dark:hover:text-amber-200 dark:bg-amber-500/20 dark:border-amber-400/50 dark:hover:bg-amber-500/30 rounded-sm"
                        variant="outline"
                        disabled={auth.restricted}
                    >
                        Hide
                    </Button>
                    {onDelete && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(faq.id);
                            }}
                            className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-sm"
                            variant="outline"
                            disabled={auth.restricted}
                        >
                            Delete
                        </Button>
                    )}
                </>
            ) : (
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(faq.id);
                    }}
                    className="flex-1 min-w-0 text-sm text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30 rounded-sm"
                    variant="outline"
                    disabled={auth.restricted}
                >
                    Delete
                </Button>
            )}
        </>
    ) : undefined;

    return (
        <>
            <BaseFaqCard
                faq={faq}
                onExpand={onExpand}
                onCollapse={onCollapse}
                onShowDetail={onShowDetail}
                expanded={expanded}
                contentLoading={contentLoading}
                actionButtons={actionButtons}
                canEdit={canEdit}
                editMode={editMode}
                onEditClick={canEdit ? () => setEditMode(true) : undefined}
                editTitle={draftTitle}
                editSummary={draftSummary}
                onEditTitleChange={setDraftTitle}
                onEditSummaryChange={setDraftSummary}
                onEditContentClick={canEdit ? () => setContentDialogOpen(true) : undefined}
                hasChanges={canEdit ? hasChanges : undefined}
                onSave={canEdit ? handleSave : undefined}
                onReset={canEdit ? handleReset : undefined}
                saving={saving}
                restricted={auth.restricted}
            />
            <EditFaqContentDialog
                open={contentDialogOpen}
                onOpenChange={setContentDialogOpen}
                faqId={faq.id}
                initialContent={contentForFaq ?? null}
                onSaveDraft={handleSaveDraftContent}
                auth={auth}
            />
        </>
    );
};
