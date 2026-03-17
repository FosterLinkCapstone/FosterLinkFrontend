import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

interface UnsavedChangesBarProps {
    hasErrors: boolean;
    saving: boolean;
    restricted: boolean;
    onReset: () => void;
    onSave: () => void;
}

export const UnsavedChangesBar = ({ hasErrors, saving, restricted, onReset, onSave }: UnsavedChangesBarProps) => (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground font-medium">
                {hasErrors ? "Fix errors before saving." : "You have unsaved changes!"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    disabled={saving}
                    className="w-full sm:w-auto gap-1.5"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </Button>
                <Button
                    size="sm"
                    onClick={onSave}
                    disabled={saving || hasErrors || restricted}
                    className="w-full sm:w-auto gap-1.5"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    </div>
);
