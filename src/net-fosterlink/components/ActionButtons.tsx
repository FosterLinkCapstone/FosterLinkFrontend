import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<typeof Button>;

export const RestoreButton = ({ className, ...props }: ButtonProps) => (
    <Button
        variant="outline"
        className={cn(
            "text-green-700 hover:text-green-800 font-medium dark:text-green-300 dark:hover:text-green-200 dark:bg-emerald-500/20 dark:border-emerald-400/50 dark:hover:bg-emerald-500/30",
            className
        )}
        {...props}
    />
);

export const DestructiveButton = ({ className, ...props }: ButtonProps) => (
    <Button
        variant="outline"
        className={cn(
            "text-red-700 hover:text-red-800 font-medium dark:text-red-300 dark:hover:text-red-200 dark:bg-red-500/20 dark:border-red-400/50 dark:hover:bg-red-500/30",
            className
        )}
        {...props}
    />
);
