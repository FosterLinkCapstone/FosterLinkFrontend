import { Badge } from "@/components/ui/badge";
import type { AdminAgencyForUserModel } from "@/net-fosterlink/backend/models/AdminAgencyForUserModel";
import { AgencyCard } from "./AgencyCard";

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300 dark:border-amber-700",
    APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700",
    DENIED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700",
    HIDDEN: "bg-muted text-muted-foreground border-border",
};

interface AdminAgencyCardProps {
    item: AdminAgencyForUserModel;
}

export const AdminAgencyCard: React.FC<AdminAgencyCardProps> = ({ item }) => {
    const statusClass = STATUS_COLORS[item.entityStatus] ?? "bg-muted text-muted-foreground border-border";

    const statusBanner = (
        <div className="mb-1 w-full">
            <Badge variant="outline" className={`block w-full text-center text-xs font-medium py-1.5 ${statusClass}`}>
                {item.entityStatus}
            </Badge>
        </div>
    );

    return (
        <div className="flex flex-col w-full gap-1">
            {statusBanner}
            <AgencyCard
                agency={item.entity}
                onRemove={() => {}}
                showRemove={false}
            />
        </div>
    );
};
