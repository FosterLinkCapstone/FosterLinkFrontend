import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import { AdminOnlyBadge } from "../badges/AdminOnlyBadge";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";

interface NavForumDropdownProps {
    auth: AuthContextType;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavForumDropdown = ({ auth, onMouseEnter, onMouseLeave, onTriggerClick }: NavForumDropdownProps) => (
    <NavigationMenuItem value="forum" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            Forum
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground !left-auto right-0">
            <ul className="grid gap-2 p-4 w-[calc(100vw-2rem)] md:w-[400px] lg:w-[500px]">
                <ListItem href="/threads" title="View threads">
                    View threads made by other users. Includes searching and filtering!
                </ListItem>
                {auth.isLoggedIn() && (
                    <ListItem href="/threads?creating=true" title="Create a new thread">
                        Create a new thread. Create a title and some content!
                    </ListItem>
                )}
                {auth.admin && (
                    <ListItem href="/threads/hidden" title="Hidden Threads">
                        <div className="flex flex-col items-center">
                            <AdminOnlyBadge />
                            <span>Review and restore or permanently delete hidden threads.</span>
                        </div>
                    </ListItem>
                )}
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
