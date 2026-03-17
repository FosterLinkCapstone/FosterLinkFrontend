import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eraser } from "lucide-react";
import type { AdminUserModel } from "@/net-fosterlink/backend/models/AdminUserModel";

interface ClearProfilePopoverProps {
    user: AdminUserModel;
    onClear: (userId: number, clearFullName: boolean, clearUsername: boolean, clearProfilePicture: boolean) => void;
    disabled?: boolean;
}

export const ClearProfilePopover = ({ user, onClear, disabled }: ClearProfilePopoverProps) => {
    const [open, setOpen] = useState(false);
    const [clearFullName, setClearFullName] = useState(false);
    const [clearUsername, setClearUsername] = useState(false);
    const [clearProfilePicture, setClearProfilePicture] = useState(false);

    const noneSelected = !clearFullName && !clearUsername && !clearProfilePicture;

    const handleClearFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setClearFullName(e.target.checked), []);
    const handleClearUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setClearUsername(e.target.checked), []);
    const handleClearProfilePictureChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setClearProfilePicture(e.target.checked), []);

    const handleSubmit = () => {
        onClear(user.id, clearFullName, clearUsername, clearProfilePicture);
        setOpen(false);
        setClearFullName(false);
        setClearUsername(false);
        setClearProfilePicture(false);
    };

    const handleCancel = () => {
        setOpen(false);
        setClearFullName(false);
        setClearUsername(false);
        setClearProfilePicture(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="text-xs border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                >
                    <Eraser className="h-3 w-3 mr-1" />
                    Clear
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4 space-y-3" align="end">
                <p className="text-sm font-medium">What would you like to clear?</p>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                        <input
                            type="checkbox"
                            checked={clearFullName}
                            onChange={handleClearFullNameChange}
                            className="rounded"
                        />
                        Full name (anonymize)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                        <input
                            type="checkbox"
                            checked={clearUsername}
                            onChange={handleClearUsernameChange}
                            className="rounded"
                        />
                        Username (anonymize)
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                        <input
                            type="checkbox"
                            checked={clearProfilePicture}
                            onChange={handleClearProfilePictureChange}
                            className="rounded"
                        />
                        Profile picture (default)
                    </label>
                </div>

                <div className="flex gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={handleSubmit}
                        disabled={noneSelected}
                    >
                        Submit
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
