import { NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Link } from "react-router"

export function ListItem({
    title, children, href, ...props
}: React.ComponentPropsWithoutRef<"li"> & {href:string}) {
    const inner = (
        <>
            <div className="text-sm leading-none font-medium">{title}</div>
            <div className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {children}
            </div>
        </>
    )

    return(
        <li {...props}>
            <NavigationMenuLink asChild>
                {href.startsWith("/") ? (
                    <Link to={href}>{inner}</Link>
                ) : (
                    <a href={href}>{inner}</a>
                )}
            </NavigationMenuLink>
        </li>
    )
}