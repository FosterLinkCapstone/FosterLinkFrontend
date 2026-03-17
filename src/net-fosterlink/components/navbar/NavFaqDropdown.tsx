import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "../ListItem";
import { AdminOnlyBadge } from "../badges/AdminOnlyBadge";
import { FaqAuthorOnlyBadge } from "../badges/FaqAuthorOnlyBadge";
import type { AuthContextType } from "@/net-fosterlink/backend/AuthContext";

interface NavFaqDropdownProps {
    auth: AuthContextType;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onTriggerClick: (e: React.MouseEvent) => void;
}

export const NavFaqDropdown = ({ auth, onMouseEnter, onMouseLeave, onTriggerClick }: NavFaqDropdownProps) => (
    <NavigationMenuItem value="faq" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <NavigationMenuTrigger
            className="text-muted-foreground hover:text-primary transition-colors bg-transparent"
            onClick={onTriggerClick}
        >
            FAQ
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
            <ul className="grid gap-2 p-4 w-[calc(100vw-2rem)] md:w-[400px] lg:w-[500px]">
                <ListItem href="/faq" title="View all FAQs">
                    View a list of all FAQs, including summaries. Supports sharing!
                </ListItem>
                {auth.admin && (
                    <ListItem href="/faq/pending" title="Pending FAQs">
                        <div className="flex flex-col items-center">
                            <AdminOnlyBadge />
                            <span>Review and approve or deny pending FAQ responses</span>
                        </div>
                    </ListItem>
                )}
                {auth.admin && (
                    <ListItem href="/faq/pending?tab=hidden-user" title="Hidden FAQs">
                        <div className="flex flex-col items-center">
                            <AdminOnlyBadge />
                            <span>Review and restore or permanently delete hidden FAQ responses.</span>
                        </div>
                    </ListItem>
                )}
                {(auth.faqAuthor || auth.admin) && (
                    <ListItem href="/faq?creating=true" title="Create FAQ Response">
                        <div className="flex flex-col items-center">
                            <FaqAuthorOnlyBadge />
                            <span>Create a new FAQ response, based on an original idea or a suggestion!</span>
                        </div>
                    </ListItem>
                )}
                {auth.isLoggedIn() && (
                    <ListItem href="/faq?suggesting=true" title="Suggest FAQ response">
                        Suggest a new FAQ response! Your suggestion will be used as the title.
                    </ListItem>
                )}
            </ul>
        </NavigationMenuContent>
    </NavigationMenuItem>
);
