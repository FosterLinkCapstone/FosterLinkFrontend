import { memo, useCallback, useMemo, type ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatFaqDate(value: Date | string): string {
    const d = typeof value === "string" ? new Date(value) : value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { ChevronDown, ChevronUp, Loader2, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import type { UserModel } from "@/net-fosterlink/backend/models/UserModel";
import { UnsavedChangesBar } from "@/net-fosterlink/components/account-settings/UnsavedChangesBar";

interface BaseFaqData {
    title: string;
    summary: string;
    author: UserModel;
    createdAt?: Date | string;
}

interface BaseFaqCardProps {
    faq: BaseFaqData;
    onExpand: () => void;
    onCollapse: () => void;
    onShowDetail: () => void;
    expanded: boolean;
    contentLoading?: boolean;
    statusBanner?: ReactNode;
    actionButtons?: ReactNode;
    canEdit?: boolean;
    editMode?: boolean;
    onEditClick?: () => void;
    editTitle?: string;
    editSummary?: string;
    onEditTitleChange?: (value: string) => void;
    onEditSummaryChange?: (value: string) => void;
    onEditContentClick?: () => void;
    hasChanges?: boolean;
    onSave?: () => void;
    onReset?: () => void;
    saving?: boolean;
    restricted?: boolean;
}

export const BaseFaqCard = memo<BaseFaqCardProps>(({
    faq,
    onExpand,
    onCollapse,
    onShowDetail,
    expanded,
    contentLoading,
    statusBanner,
    actionButtons,
    canEdit,
    editMode,
    onEditClick,
    editTitle,
    editSummary,
    onEditTitleChange,
    onEditSummaryChange,
    onEditContentClick,
    hasChanges,
    onSave,
    onReset,
    saving,
    restricted,
}) => {
    const navigate = useNavigate();
    const isEditing = useMemo(() => !!(canEdit && expanded && editMode), [canEdit, expanded, editMode]);
    const displayTitle = useMemo(() => isEditing && editTitle !== undefined ? editTitle : faq.title, [isEditing, editTitle, faq.title]);
    const displaySummary = useMemo(() => isEditing && editSummary !== undefined ? editSummary : faq.summary, [isEditing, editSummary, faq.summary]);
    const showEditButton = useMemo(() => !!(canEdit && expanded && !editMode && onEditClick), [canEdit, expanded, editMode, onEditClick]);

    const handleAuthorClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(buildProfileUrl(faq.author));
    }, [navigate, faq.author]);
    const handleToggleExpand = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (expanded) { onCollapse(); } else { onExpand(); }
    }, [expanded, onCollapse, onExpand]);
    const handleShowDetail = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onShowDetail();
    }, [onShowDetail]);
    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEditClick!();
    }, [onEditClick]);
    const handleEditContentClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEditContentClick!();
    }, [onEditContentClick]);
    const handleResetClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onReset!();
    }, [onReset]);
    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onEditTitleChange!(e.target.value), [onEditTitleChange]);
    const handleSummaryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => onEditSummaryChange!(e.target.value), [onEditSummaryChange]);

    return (
        <div className="flex flex-col w-full gap-1">
            {statusBanner}
            <Card
                className="mb-4 overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border"
                onClick={onExpand}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="w-10 ml-4"></div>
                        <div className="flex-1 text-center">
                            {isEditing && onEditTitleChange ? (
                                <Input
                                    value={editTitle ?? faq.title}
                                    onChange={handleTitleChange}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xl font-semibold text-center mb-2"
                                    placeholder="Title"
                                />
                            ) : (
                                <h3 className="text-xl font-semibold mb-2">{displayTitle}</h3>
                            )}
                            <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-muted-foreground">
                                <button
                                    onClick={handleAuthorClick}
                                    className="flex flex-row gap-2 hover:text-primary focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <span>By</span>
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={faq.author.profilePictureUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {getInitials(faq.author.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{faq.author.username}</span>
                                </button>
                                {faq.createdAt != null && (
                                    <span className="text-muted-foreground">
                                        · Posted {formatFaqDate(faq.createdAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleToggleExpand}
                            className="p-2 hover:bg-accent rounded-full transition-colors ml-4"
                        >
                            {expanded ? (
                                <ChevronUp className="h-6 w-6 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-6 w-6 text-muted-foreground" />
                            )}
                        </button>
                    </div>
                </div>

                {expanded && (
                    <>
                        <div className="bg-muted p-6 text-center">
                            {isEditing && onEditSummaryChange ? (
                                <MarkdownTextarea
                                    value={editSummary ?? faq.summary}
                                    onChange={handleSummaryChange}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full min-h-[80px] resize-none"
                                    placeholder="Summary"
                                    restricted
                                />
                            ) : (
                                <MarkdownContent content={displaySummary} className="text-foreground mb-4" restricted />
                            )}
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    onClick={handleShowDetail}
                                    className="text-sm text-primary hover:text-primary/90 font-medium"
                                    disabled={contentLoading}
                                >
                                    Click for more!
                                </button>
                                {showEditButton && (
                                    <button
                                        onClick={handleEditClick}
                                        className="text-sm text-primary hover:text-primary/90 font-medium inline-flex items-center gap-1"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit
                                    </button>
                                )}
                                {isEditing && onEditContentClick && (
                                    <button
                                        onClick={handleEditContentClick}
                                        className="text-sm text-primary hover:text-primary/90 font-medium inline-flex items-center gap-1"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit full content
                                    </button>
                                )}
                                {isEditing && onReset && (
                                    <button
                                        onClick={handleResetClick}
                                        className="text-sm text-muted-foreground hover:text-foreground font-medium"
                                    >
                                        Cancel editing
                                    </button>
                                )}
                                {contentLoading && (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" aria-hidden />
                                )}
                            </div>
                        </div>
                        {actionButtons && (
                            <div className="py-0.5 px-2 border-t border-border bg-background flex w-full gap-2 [&>*]:flex-1 [&>*]:min-w-0">
                                {actionButtons}
                            </div>
                        )}
                    </>
                )}
            </Card>
            {hasChanges && onSave && onReset && (
                <UnsavedChangesBar
                    hasErrors={false}
                    saving={saving ?? false}
                    restricted={restricted ?? false}
                    onReset={onReset}
                    onSave={onSave}
                />
            )}
        </div>
    );
});
