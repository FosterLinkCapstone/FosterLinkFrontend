import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";
import { faqApi } from "@/net-fosterlink/backend/api/FaqApi";

interface EditFaqContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faqId: number;
    initialContent: string | null;
    onSaveDraft: (content: string) => void;
    auth: AuthContextType;
}

export const EditFaqContentDialog = ({
    open,
    onOpenChange,
    faqId,
    initialContent,
    onSaveDraft,
    auth,
}: EditFaqContentDialogProps) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (initialContent !== null && initialContent !== undefined) {
            setContent(initialContent);
            return;
        }
        setLoading(true);
        faqApi(auth).getContent(faqId).then((res) => {
            if (!res.isError && res.data != null) {
                setContent(res.data);
            } else {
                setContent("");
            }
        }).finally(() => setLoading(false));
    }, [open, faqId, initialContent, auth]);

    const handleSave = () => {
        setSaving(true);
        onSaveDraft(content);
        onOpenChange(false);
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-background rounded-3xl border-border">
                <DialogHeader className="p-6 pb-4 border-border shrink-0">
                    <DialogTitle className="text-xl font-bold">Edit full content</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            placeholder="FAQ content..."
                        />
                    )}
                </div>
                <div className="p-4 border-t border-border bg-background rounded-b-3xl flex justify-end gap-2 shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading || saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save to draft"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
