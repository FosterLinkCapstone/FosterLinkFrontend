import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ThreadReplySidebarProps {
    replyText: string;
    replyFieldErrors: { [key: string]: string };
    replyError: string;
    isLoggedIn: boolean;
    restricted: boolean;
    loading: boolean;
    onReplyTextChange: (text: string) => void;
    onSubmit: () => void;
}

export const ThreadReplySidebar = ({
    replyText,
    replyFieldErrors,
    replyError,
    isLoggedIn,
    restricted,
    loading,
    onReplyTextChange,
    onSubmit,
}: ThreadReplySidebarProps) => (
    <Card className="p-4 border-border">
        <h3 className="font-semibold mb-3">Reply</h3>
        <div className="grid gap-2 mb-3">
            <Textarea
                placeholder="Enter reply here..."
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                className="min-h-[120px]"
                disabled={!isLoggedIn || restricted}
            />
            <span className="text-red-500">{replyFieldErrors["content"]}</span>
        </div>
        {replyError && <p className="text-red-500 text-sm mb-2">{replyError}</p>}
        <Button onClick={onSubmit} className="w-full" disabled={!isLoggedIn || restricted || loading}>
            {loading ? "Submitting..." : "Submit"}
        </Button>
    </Card>
);
