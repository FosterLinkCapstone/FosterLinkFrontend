interface EmptyStateProps {
    message: string;
    error?: string | null;
}

export const EmptyState = ({ message, error }: EmptyStateProps) => (
    <div className="text-center py-12">
        <p className="text-muted-foreground">{message}</p>
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
    </div>
);
