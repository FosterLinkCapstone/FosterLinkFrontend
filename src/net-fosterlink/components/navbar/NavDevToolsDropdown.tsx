import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import { AdminOnlyBadge } from "../badges/AdminOnlyBadge";

interface NavDevToolsDropdownProps {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavDevToolsDropdown = ({ onMouseEnter, onMouseLeave, onTriggerClick }: NavDevToolsDropdownProps) => (
    <NavigationMenuItem value="devtools" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            DevTools
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
            <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                {import.meta.env.VITE_BRANCH === "staging" ? (
                    <>
                        <ListItem href="#" title="Grafana Backend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Grafana backend is only available on production</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_GRAF_DB_FRONTEND_STAGING} title="Grafana Frontend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Grafana to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_BACKEND_STAGING} title="Azure Backend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_FRONTEND_STAGING} title="Azure Frontend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_DB_STAGING} title="Azure Database">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_ALLOY} title="Alloy Compute Instance">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to GCloud to view</span>
                            </div>
                        </ListItem>
                    </>
                ) : import.meta.env.VITE_BRANCH === "master" ? (
                    <>
                        <ListItem href={import.meta.env.VITE_GRAF_DB_BACKEND} title="Grafana Backend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Grafana to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_GRAF_DB_FRONTEND_PROD} title="Grafana Frontend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Grafana to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_BACKEND_PROD} title="Azure Backend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_FRONTEND_PROD} title="Azure Frontend">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_AZURE_DB_PROD} title="Azure Database">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to Azure to view</span>
                            </div>
                        </ListItem>
                        <ListItem href={import.meta.env.VITE_ALLOY} title="Alloy Compute Instance">
                            <div className="flex flex-col items-center">
                                <AdminOnlyBadge />
                                <span>Must be logged in to GCloud to view</span>
                            </div>
                        </ListItem>
                    </>
                ) : (
                    <ListItem href="#" title="Not Available">
                        <div className="flex flex-col items-center">
                            <AdminOnlyBadge />
                            <span>DevTools are only available in staging and production environments</span>
                        </div>
                    </ListItem>
                )}
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
