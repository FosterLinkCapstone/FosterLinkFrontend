import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Link } from "react-router";
import { useAuth } from "../../backend/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserModel } from "../../backend/models/UserModel";
import { useTheme } from "@/ThemeProvider";
import { Moon, Sun, Monitor, ShieldAlert, Menu } from "lucide-react";
import { useNavbarHover } from "../../hooks/useNavbarHover";
import { NavForumDropdown } from "./NavForumDropdown";
import { NavFaqDropdown } from "./NavFaqDropdown";
import { NavAgenciesDropdown } from "./NavAgenciesDropdown";
import { NavAdminDropdown } from "./NavAdminDropdown";
import { NavDevToolsDropdown } from "./NavDevToolsDropdown";
import { NavAccountDropdown } from "./NavAccountDropdown";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";

const mobileLinkClass =
    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors";
const mobileSectionLabel =
    "px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider";

export const Navbar = ({ userInfo }: { userInfo: UserModel | undefined }) => {
    const auth = useAuth();
    const { theme, setTheme } = useTheme();
    const { openItem, handleItemEnter, handleItemLeave, handleTriggerClick, handleValueChange } = useNavbarHover();

    const cycleTheme = () => {
        setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
    };

    const themeIcon =
        theme === "light" ? <Sun className="h-5 w-5" /> :
        theme === "dark"  ? <Moon className="h-5 w-5" /> :
                            <Monitor className="h-5 w-5" />;

    const themeLabel = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

    return (
        <nav className="bg-background shadow-sm border-b w-full border-border">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo — always visible */}
                    <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
                        FosterLink
                    </Link>

                    {/* Desktop nav — hidden on mobile */}
                    <div className="hidden md:flex items-center gap-6">
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
                            {themeIcon}
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

                    {/* Mobile hamburger — visible only below md */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle className="text-primary">FosterLink</SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-col px-2 pb-6">
                                {/* Main navigation */}
                                <p className={mobileSectionLabel}>Navigation</p>
                                <SheetClose asChild>
                                    <Link to="/" className={mobileLinkClass}>Home</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/threads" className={mobileLinkClass}>Forum</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/faq" className={mobileLinkClass}>FAQ</Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link to="/agencies" className={mobileLinkClass}>Agencies</Link>
                                </SheetClose>

                                {/* Admin section */}
                                {auth.admin && (
                                    <>
                                        <p className={mobileSectionLabel}>Admin</p>
                                        <SheetClose asChild>
                                            <Link to="/admin/users" className={mobileLinkClass}>User Management</Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link to="/admin/account-deletion-requests" className={mobileLinkClass}>Account Deletion Requests</Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link to="/admin/audit-log" className={mobileLinkClass}>Audit Log</Link>
                                        </SheetClose>
                                    </>
                                )}

                                {/* DevTools section */}
                                {auth.admin && (
                                    <>
                                        <p className={mobileSectionLabel}>DevTools</p>
                                        {import.meta.env.VITE_BRANCH === "staging" ? (
                                            <>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_GRAF_DB_FRONTEND_STAGING} className={mobileLinkClass}>Grafana Frontend</a>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_AZURE_BACKEND_STAGING} className={mobileLinkClass}>Azure Backend</a>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_AZURE_FRONTEND_STAGING} className={mobileLinkClass}>Azure Frontend</a>
                                                </SheetClose>
                                            </>
                                        ) : import.meta.env.VITE_BRANCH === "master" ? (
                                            <>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_GRAF_DB_BACKEND} className={mobileLinkClass}>Grafana Backend</a>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_GRAF_DB_FRONTEND_PROD} className={mobileLinkClass}>Grafana Frontend</a>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <a href={import.meta.env.VITE_AZURE_BACKEND_PROD} className={mobileLinkClass}>Azure Backend</a>
                                                </SheetClose>
                                            </>
                                        ) : (
                                            <span className={`${mobileLinkClass} text-muted-foreground cursor-default`}>
                                                Only available in staging / production
                                            </span>
                                        )}
                                    </>
                                )}

                                {/* Account links */}
                                <p className={mobileSectionLabel}>Account</p>
                                {auth.isLoggedIn() ? (
                                    <>
                                        {userInfo && (
                                            <SheetClose asChild>
                                                <Link to={buildProfileUrl(userInfo)} className={mobileLinkClass}>My Profile</Link>
                                            </SheetClose>
                                        )}
                                        <SheetClose asChild>
                                            <Link to="/settings" className={mobileLinkClass}>Account Settings</Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <button onClick={auth.logout} className={`${mobileLinkClass} w-full text-left`}>
                                                Logout
                                            </button>
                                        </SheetClose>
                                    </>
                                ) : (
                                    <>
                                        <SheetClose asChild>
                                            <Link to={`/login?currentPage=${window.location.pathname}`} className={mobileLinkClass}>Login</Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link to="/register" className={mobileLinkClass}>Register</Link>
                                        </SheetClose>
                                    </>
                                )}

                                {/* Theme toggle */}
                                <div className="mt-4 flex items-center gap-2 px-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={cycleTheme}
                                        aria-label={`Theme: ${theme}. Click to switch.`}
                                        className="shrink-0"
                                    >
                                        {themeIcon}
                                    </Button>
                                    <span className="text-sm text-muted-foreground">{themeLabel} theme</span>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};
