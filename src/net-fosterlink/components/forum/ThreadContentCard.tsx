import { Card } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MarkdownTextarea } from "@/components/ui/markdown-textarea";

interface ThreadContentCardProps {
    content: string;
    editing: boolean;
    editedContent: string;
    onEditedContentChange: (value: string) => void;
    onSubmitEdit: () => void;
}

export const ThreadContentCard = ({
    content,
    editing,
    editedContent,
    onEditedContentChange,
    onSubmitEdit,
}: ThreadContentCardProps) => (
    <Card className="p-6 mb-6 border-border">
        <div className="max-w-none">
            {editing ? (
                <MarkdownTextarea
                    value={editedContent}
                    onChange={(e) => onEditedContentChange(e.target.value)}
                    onSubmit={onSubmitEdit}
                    className="w-full min-h-[200px]"
                    id="editedContent"
                />
            ) : (
                <MarkdownContent content={content} className="text-foreground" />
            )}
        </div>
    </Card>
);
