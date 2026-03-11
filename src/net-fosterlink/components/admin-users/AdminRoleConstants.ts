export type SearchBy = "FULL_NAME" | "USERNAME" | "EMAIL" | "PHONE_NUMBER" | "ROLE";
export type RoleKey = "ADMINISTRATOR" | "FAQ_AUTHOR" | "AGENCY_REP" | "VERIFIED_FOSTER" | "ID_VERIFIED";

export interface RoleMeta {
    label: string;
    key: RoleKey;
    assignable: boolean;
    activeClass: string;
    inactiveClass: string;
}

export const ROLE_META: RoleMeta[] = [
    {
        key: "ADMINISTRATOR",
        label: "Administrator",
        assignable: true,
        activeClass: "border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
        inactiveClass: "border-amber-300/50 dark:border-amber-700/40 bg-transparent text-amber-600/60 dark:text-amber-400/50",
    },
    {
        key: "FAQ_AUTHOR",
        label: "FAQ Author",
        assignable: true,
        activeClass: "border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
        inactiveClass: "border-emerald-300/50 dark:border-emerald-700/40 bg-transparent text-emerald-600/60 dark:text-emerald-400/50",
    },
    {
        key: "AGENCY_REP",
        label: "Agency Rep",
        assignable: true,
        activeClass: "border-blue-400 dark:border-blue-600 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
        inactiveClass: "border-blue-300/50 dark:border-blue-700/40 bg-transparent text-blue-600/60 dark:text-blue-400/50",
    },
    {
        key: "VERIFIED_FOSTER",
        label: "Foster Verified",
        assignable: true,
        activeClass: "border-purple-400 dark:border-purple-600 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200",
        inactiveClass: "border-purple-300/50 dark:border-purple-700/40 bg-transparent text-purple-600/60 dark:text-purple-400/50",
    },
    {
        key: "ID_VERIFIED",
        label: "ID Verified",
        assignable: true,
        activeClass: "border-sky-400 dark:border-sky-600 bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-200",
        inactiveClass: "border-sky-300/50 dark:border-sky-700/40 bg-transparent text-sky-600/60 dark:text-sky-400/50",
    },
];

export function formatRestrictionInfo(restrictedUntil: string | null): string {
    if (!restrictedUntil) return "indefinitely";
    const until = new Date(restrictedUntil);
    const now = new Date();
    const diffMs = until.getTime() - now.getTime();
    if (diffMs <= 0) return "expiring soon";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 24) return `${diffHours}h remaining`;
    if (diffDays === 1) return "1 day remaining";
    if (diffDays < 7) return `${diffDays} days remaining`;
    return `until ${until.toLocaleDateString()}`;
}

export function hasRole(user: { administrator: boolean; faqAuthor: boolean; verifiedAgencyRep: boolean; verifiedFoster: boolean; idVerified: boolean }, key: RoleKey): boolean {
    switch (key) {
        case "ADMINISTRATOR": return user.administrator;
        case "FAQ_AUTHOR": return user.faqAuthor;
        case "AGENCY_REP": return user.verifiedAgencyRep;
        case "VERIFIED_FOSTER": return user.verifiedFoster;
        case "ID_VERIFIED": return user.idVerified;
    }
}
