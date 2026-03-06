import { Badge } from "@/components/ui/badge";

type RoleBadgeVariant = "admin" | "agent" | "faqAuthor";

const ROLE_BADGE_CONFIG: Record<RoleBadgeVariant, { label: string; className: string }> = {
    admin: {
        label: "Admin Only",
        className: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/50 dark:text-amber-50 dark:border-amber-400/70",
    },
    agent: {
        label: "Agency Representative Only",
        className: "bg-primary/10 text-primary border-primary/30 dark:bg-primary/30 dark:text-primary-foreground dark:border-primary/50",
    },
    faqAuthor: {
        label: "Faq Author Only",
        className: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/50 dark:text-emerald-50 dark:border-emerald-400/70",
    },
};

export const RoleBadge = ({ variant }: { variant: RoleBadgeVariant }) => {
    const { label, className } = ROLE_BADGE_CONFIG[variant];
    return (
        <Badge variant="outline" className={className}>{label}</Badge>
    );
};
