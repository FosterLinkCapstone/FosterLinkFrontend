import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";
import type { UserModel } from "@/net-fosterlink/backend/models/UserModel";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";

interface NavAccountDropdownProps {
    auth: AuthContextType;
    userInfo: UserModel | undefined;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavAccountDropdown = ({ auth, userInfo, onMouseEnter, onMouseLeave, onTriggerClick }: NavAccountDropdownProps) => (
    <NavigationMenuItem value="account" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            My Account
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
            <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                {auth.isLoggedIn() ? (
                    <>
                        {userInfo && (
                            <ListItem href={buildProfileUrl(userInfo)} title="My Profile">
                                View your public profile and posts
                            </ListItem>
                        )}
                        <ListItem href="/settings" title="Account Settings">
                            Update your profile info, email, username, and more
                        </ListItem>
                        <li className="list-none">
                            <a
                                onClick={auth.logout}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                            >
                                <div className="text-sm font-medium leading-none">Logout</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    Sign out of your account
                                </p>
                            </a>
                        </li>
                    </>
                ) : (
                    <>
                        <ListItem href={`/login?currentPage=${window.location.pathname}`} title="Login">
                            Sign in to your account
                        </ListItem>
                        <ListItem href="/register" title="Register">
                            Create a new account
                        </ListItem>
                    </>
                )}
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
