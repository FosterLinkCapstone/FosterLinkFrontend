import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import { AdminOnlyBadge } from "../badges/AdminOnlyBadge";

interface NavAdminDropdownProps {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavAdminDropdown = ({ onMouseEnter, onMouseLeave, onTriggerClick }: NavAdminDropdownProps) => (
    <NavigationMenuItem value="admin" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            Admin
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
            <ul className="grid gap-2 p-4 w-[calc(100vw-2rem)] md:w-[400px] lg:w-[500px]">
                <ListItem href="/admin/users" title="User Management">
                    <div className="flex flex-col items-center">
                        <AdminOnlyBadge />
                        <span>Search users, manage roles, and enact bans or restrictions</span>
                    </div>
                </ListItem>
                <ListItem href="/admin/account-deletion-requests" title="Account Deletion Requests">
                    <div className="flex flex-col items-center">
                        <AdminOnlyBadge />
                        <span>Review and approve or delay pending account deletion requests</span>
                    </div>
                </ListItem>
                <ListItem href="/admin/audit-log" title="Audit Log">
                    <div className="flex flex-col items-center">
                        <AdminOnlyBadge />
                        <span>View a log of all administrative actions taken on the platform</span>
                    </div>
                </ListItem>
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
