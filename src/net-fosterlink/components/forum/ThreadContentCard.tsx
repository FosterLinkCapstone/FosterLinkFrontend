import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
                <Textarea
                    value={editedContent}
                    onChange={(e) => onEditedContentChange(e.target.value)}
                    onSubmit={onSubmitEdit}
                    className="w-full min-h-[200px]"
                    id="editedContent"
                />
            ) : (
                <p className="whitespace-pre-wrap text-foreground">{content}</p>
            )}
        </div>
    </Card>
);
