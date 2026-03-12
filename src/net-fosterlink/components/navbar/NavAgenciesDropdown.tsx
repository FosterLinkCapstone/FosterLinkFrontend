import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import { AdminOnlyBadge } from "../badges/AdminOnlyBadge";
import { AgentOnlyBadge } from "../badges/AgentOnlyBadge";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";

interface NavAgenciesDropdownProps {
    auth: AuthContextType;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavAgenciesDropdown = ({ auth, onMouseEnter, onMouseLeave, onTriggerClick }: NavAgenciesDropdownProps) => (
    <NavigationMenuItem value="agencies" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            Agencies
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
            <ul className="grid gap-2 p-4 w-[calc(100vw-2rem)] md:w-[400px] lg:w-[500px]">
                <ListItem href="/agencies" title="View All Agencies">
                    View a list of every agency, their locations, mission statements, and agent information.
                </ListItem>
                {auth.admin && (
                    <>
                        <ListItem href="/agencies/pending" title="Pending agencies">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Review, approve, or deny pending agency requests</span>
                            </div>
                        </ListItem>
                        <ListItem href="/agencies/pending?tab=deletion" title="Deletion Requests">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Review and approve or deny pending agency deletion requests</span>
                            </div>
                        </ListItem>
                        <ListItem href="/agencies/pending?tab=hidden" title="Hidden Agencies">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Review and restore or permanently delete hidden agencies</span>
                            </div>
                        </ListItem>
                    </>
                )}
                {(auth.admin || auth.agent) && (
                    <ListItem href="/agencies?creating=true" title="Create a new agency">
                        <div className="flex flex-col items-center">
                            <AgentOnlyBadge />
                            <span>Create a new agency, which will be listed on the agencies page!</span>
                        </div>
                    </ListItem>
                )}
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
