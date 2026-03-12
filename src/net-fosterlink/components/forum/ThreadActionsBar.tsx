import { Button } from "@/components/ui/button";
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner";

interface ThreadActionsBarProps {
    isAdmin: boolean;
    isAuthor: boolean;
    editing: boolean;
    loading: boolean;
    restricted: boolean;
    /** Author: delete (soft). Admin: hide (soft). */
    onHideOrDelete: () => void;
    /** Admin only: permanently delete (after hiding). */
    onPermanentDelete?: () => void;
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
    onPermanentDelete,
    onToggleEdit,
    onSubmitEdit,
}: ThreadActionsBarProps) => (
    <div className="flex items-center gap-1.5">
        {(isAdmin || isAuthor) && (
            <>
                <Button
                    variant="outline"
                    className="mb-4 bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700/70 dark:hover:bg-amber-900/70"
                    onClick={onHideOrDelete}
                    disabled={restricted}
                >
                    {isAdmin ? "Hide" : "Delete"}
                </Button>
                {isAdmin && onPermanentDelete && (
                    <Button
                        variant="outline"
                        className="mb-4 bg-red-200 text-red-400 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/70 dark:hover:bg-red-900/70"
                        onClick={onPermanentDelete}
                        disabled={restricted}
                    >
                        Delete
                    </Button>
                )}
            </>
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
