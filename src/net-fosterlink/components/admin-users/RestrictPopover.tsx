import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ShieldAlert } from "lucide-react";
import type { AdminUserModel } from "@/net-fosterlink/backend/models/AdminUserModel";

interface RestrictPopoverProps {
    user: AdminUserModel;
    onRestrict: (userId: number, until?: string) => void;
    onUnrestrict: (userId: number) => void;
    disabled?: boolean;
}

export const RestrictPopover = ({ user, onRestrict, onUnrestrict, disabled }: RestrictPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [forever, setForever] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const isRestricted = user.restrictedAt !== null;

    if (isRestricted) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => onUnrestrict(user.id)}
                disabled={disabled}
                className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
            >
                Unrestrict
            </Button>
        );
    }

    const handleToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setForever(e.target.checked);
        if (e.target.checked) setSelectedDate(undefined);
    }, []);
    const handleDateSelect = useCallback((date: Date | undefined) => setSelectedDate(date), []);

    const handleConfirm = () => {
        const until = !forever && selectedDate
            ? selectedDate.toISOString().slice(0, 19)
            : undefined;
        onRestrict(user.id, until);
        setOpen(false);
        setForever(true);
        setSelectedDate(undefined);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Restrict
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-3" align="end">
                <p className="text-sm font-medium">Restrict until...</p>

                <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                    <input
                        type="checkbox"
                        checked={forever}
                        onChange={handleToggle}
                        className="rounded"
                    />
                    Forever (indefinite)
                </label>

                <div className={forever ? "opacity-40 pointer-events-none" : ""}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date <= new Date()}
                    />
                </div>

                <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConfirm}
                    disabled={!forever && !selectedDate}
                >
                    Confirm Restriction
                </Button>
            </PopoverContent>
        </Popover>
    );
};
