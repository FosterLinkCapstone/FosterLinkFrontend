import { Badge } from "@/components/ui/badge"

export const AdminOnlyBadge = () => {
    return (
        <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/50 dark:text-amber-50 dark:border-amber-400/70">Admin Only</Badge>
    )
}