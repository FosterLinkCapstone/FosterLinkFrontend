import { Card } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";

interface ThreadContentCardProps {
    content: string;
    editing: boolean;
    editedContent: string;
    onEditedContentChange: (value: string) => void;
    onSubmitEdit: () => void;
    editError?: string;
    editFieldError?: string;
}

export const ThreadContentCard = ({
    content,
    editing,
    editedContent,
    onEditedContentChange,
    onSubmitEdit,
    editError,
    editFieldError,
}: ThreadContentCardProps) => (
    <Card className="p-6 mb-6 border-border">
        <div className="max-w-none">
            {editing ? (
                <>
                    <MarkdownTextarea
                        value={editedContent}
                        onChange={(e) => onEditedContentChange(e.target.value)}
                        onSubmit={onSubmitEdit}
                        className="w-full min-h-[200px]"
                        id="editedContent"
                    />
                    {editFieldError && <p className="text-destructive text-sm mt-1">{editFieldError}</p>}
                    {editError && <p className="text-destructive text-sm mt-1">{editError}</p>}
                </>
            ) : (
                <MarkdownContent content={content} className="text-foreground" />
            )}
        </div>
    </Card>
);
