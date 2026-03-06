import { Button } from "@/components/ui/button";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";

interface ThreadActionsBarProps {
    isAdmin: boolean;
    isAuthor: boolean;
    editing: boolean;
    loading: boolean;
    restricted: boolean;
    onHideOrDelete: () => void;
    onToggleEdit: () => void;
    onSubmitEdit: () => void;
}

export const ThreadActionsBar = ({
    isAdmin,
    isAuthor,
    editing,
    loading,
    restricted,
    onHideOrDelete,
    onToggleEdit,
    onSubmitEdit,
}: ThreadActionsBarProps) => (
    <div className="flex items-center gap-1.5">
        {(isAdmin || isAuthor) && (
            <Button
                variant="outline"
                className="mb-4 bg-red-200 text-red-400"
                onClick={onHideOrDelete}
                disabled={restricted}
            >
                {isAdmin ? "Hide" : "Delete"}
            </Button>
        )}
        {isAuthor && (
            <>
                <Button
                    variant="outline"
                    className="mb-4"
                    onClick={onToggleEdit}
                    disabled={restricted}
                >
                    {editing ? "Cancel" : "Edit Thread"}
                </Button>
                {editing && (
                    <Button variant="outline" className="mb-4" onClick={onSubmitEdit} disabled={restricted}>
                        Submit
                    </Button>
                )}
            </>
        )}
        <BackgroundLoadSpinner loading={loading} />
    </div>
);
