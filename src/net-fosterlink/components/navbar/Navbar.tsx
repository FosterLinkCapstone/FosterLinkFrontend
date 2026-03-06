import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Link } from "react-router";
import { useAuth } from "../../backend/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserModel } from "../../backend/models/UserModel";
import { useTheme } from "@/ThemeProvider";
import { Moon, Sun, Monitor, ShieldAlert } from "lucide-react";
import { useNavbarHover } from "../../hooks/useNavbarHover";
import { NavForumDropdown } from "./NavForumDropdown";
import { NavFaqDropdown } from "./NavFaqDropdown";
import { NavAgenciesDropdown } from "./NavAgenciesDropdown";
import { NavAdminDropdown } from "./NavAdminDropdown";
import { NavDevToolsDropdown } from "./NavDevToolsDropdown";
import { NavAccountDropdown } from "./NavAccountDropdown";

export const Navbar = ({ userInfo }: { userInfo: UserModel | undefined }) => {
    const auth = useAuth();
    const { theme, setTheme } = useTheme();
    const { openItem, handleItemEnter, handleItemLeave, handleTriggerClick, handleValueChange } = useNavbarHover();

    const cycleTheme = () => {
        setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
    };

    return (
        <nav className="bg-background shadow-sm border-b w-full border-border">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
                        FosterLink
                    </Link>

                    <div className="flex items-center gap-6">
                        <NavigationMenu value={openItem ?? ""} onValueChange={handleValueChange} viewport={false}>
                            <NavigationMenuList className="flex gap-6">
                                <NavigationMenuItem>
                                    <Link className="hover:text-primary transition-colors bg-transparent text-foreground font-semibold" to="/">Home</Link>
                                </NavigationMenuItem>

                                <NavForumDropdown
                                    auth={auth}
                                    onMouseEnter={() => handleItemEnter("forum")}
                                    onMouseLeave={handleItemLeave}
                                    onTriggerClick={handleTriggerClick}
                                />

                                <NavFaqDropdown
                                    auth={auth}
                                    onMouseEnter={() => handleItemEnter("faq")}
                                    onMouseLeave={handleItemLeave}
                                    onTriggerClick={handleTriggerClick}
                                />

                                <NavAgenciesDropdown
                                    auth={auth}
                                    onMouseEnter={() => handleItemEnter("agencies")}
                                    onMouseLeave={handleItemLeave}
                                    onTriggerClick={handleTriggerClick}
                                />

                                {auth.admin && (
                                    <NavAdminDropdown
                                        onMouseEnter={() => handleItemEnter("admin")}
                                        onMouseLeave={handleItemLeave}
                                        onTriggerClick={handleTriggerClick}
                                    />
                                )}

                                {auth.admin && (
                                    <NavDevToolsDropdown
                                        onMouseEnter={() => handleItemEnter("devtools")}
                                        onMouseLeave={handleItemLeave}
                                        onTriggerClick={handleTriggerClick}
                                    />
                                )}

                                <NavAccountDropdown
                                    auth={auth}
                                    userInfo={userInfo}
                                    onMouseEnter={() => handleItemEnter("account")}
                                    onMouseLeave={handleItemLeave}
                                    onTriggerClick={handleTriggerClick}
                                />
                            </NavigationMenuList>
                        </NavigationMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={cycleTheme}
                            aria-label={`Theme: ${theme}. Click to switch.`}
                            className="shrink-0"
                        >
                            {theme === "light" ? (
                                <Sun className="h-5 w-5" />
                            ) : theme === "dark" ? (
                                <Moon className="h-5 w-5" />
                            ) : (
                                <Monitor className="h-5 w-5" />
                            )}
                        </Button>

                        {userInfo && auth.isLoggedIn() && (
                            <div className="flex items-center gap-2 ml-4">
                                <Badge variant="outline" className="dark:bg-muted/80 dark:border-border">
                                    Logged in as {userInfo.username}
                                </Badge>
                                {auth.restricted && (
                                    <Badge className="px-2 py-0.5 rounded-full border-orange-400 dark:border-orange-600 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 text-xs font-medium">
                                        <ShieldAlert className="h-3 w-3 mr-1 inline" />
                                        Restricted
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
