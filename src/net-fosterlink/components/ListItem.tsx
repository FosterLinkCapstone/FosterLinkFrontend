import { NavigationMenuLink } from "@/components/ui/navigation-menu"
// TODO change href
export function ListItem({
    title, children, href, ...props
}: React.ComponentPropsWithoutRef<"li"> & {href:string}) {
    return(
        <li {...props}>
            <NavigationMenuLink asChild>
                <a href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
}