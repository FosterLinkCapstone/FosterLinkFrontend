import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => (
    <div
        className={cn(
            "rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin",
            size === "sm" && "size-6",
            size === "md" && "size-8",
            size === "lg" && "size-12",
            className
        )}
    />
);
