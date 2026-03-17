import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Ban, ShieldAlert } from "lucide-react";
import { getInitials } from "@/net-fosterlink/util/StringUtil";
import { buildProfileUrl } from "@/net-fosterlink/util/UserUtil";
import type { AdminUserModel } from "@/net-fosterlink/backend/models/AdminUserModel";
import { ROLE_META, formatRestrictionInfo, hasRole, type RoleKey } from "./AdminRoleConstants";
import { memo, useState } from "react";
import { RestrictPopover } from "./RestrictPopover";
import { ClearProfilePopover } from "./ClearProfilePopover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserCardProps {
    user: AdminUserModel;
    deleted?: boolean;
    onRoleToggle: (user: AdminUserModel, key: RoleKey, current: boolean) => void;
    onBan: (user: AdminUserModel) => void;
    onUnban: (user: AdminUserModel) => void;
    onRestrict: (userId: number, until?: string) => void;
    onUnrestrict: (userId: number) => void;
    onClear: (userId: number, clearFullName: boolean, clearUsername: boolean, clearProfilePicture: boolean) => void;
}

export const UserCard = memo(({ user, deleted, onRoleToggle, onBan, onUnban, onRestrict, onUnrestrict, onClear }: UserCardProps) => {
    const [openZeroTooltipLabel, setOpenZeroTooltipLabel] = useState<string | null>(null);
    const isBanned = user.bannedAt !== null;
    const isRestricted = user.restrictedAt !== null;
    const fullName = `${user.firstName} ${user.lastName}`;

    const profileUrl = buildProfileUrl(user);

    const faqSuggestionsUrl = `/admin/users/${user.id}/faq-suggestions`;
    const faqAnswersUrl = `/admin/users/${user.id}/faq-answers`;
    const agenciesUrl = `/admin/users/${user.id}/agencies`;
    const repliesUrl = `/admin/users/${user.id}/replies`;
    const threadsUrl = `/admin/users/${user.id}/threads`;
    const stats = [
        { label: "threads", value: user.postCount, href: threadsUrl },
        { label: "replies", value: user.replyCount, href: repliesUrl },
        { label: "agencies", value: user.agencyCount, href: agenciesUrl },
        { label: "FAQ answers", value: user.faqAnswerCount, href: faqAnswersUrl },
        { label: "FAQ suggestions", value: user.faqSuggestionCount, href: faqSuggestionsUrl },
    ];

    return (
        <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-2">
                <Link to={profileUrl} title={`View ${user.username}'s profile`} className="row-span-2 self-start">
                    <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
                        <AvatarImage src={user.profilePictureUrl ?? undefined} alt={user.username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                <div className="min-w-0 text-left self-start">
                    <div className="flex items-center gap-2 flex-wrap justify-start">
                        <Link to={profileUrl} className="font-semibold hover:text-primary hover:underline transition-colors leading-tight">{fullName}</Link>
                        {isBanned && (
                            <Badge className="px-2 py-0 text-xs rounded-full border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
                                <Ban className="h-3 w-3 mr-1 inline" /> Banned
                            </Badge>
                        )}
                        {isRestricted && (
                            <Badge className="px-2 py-0 text-xs rounded-full border-orange-400 dark:border-orange-600 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200">
                                <ShieldAlert className="h-3 w-3 mr-1 inline" />
                                Restricted · {formatRestrictionInfo(user.restrictedUntil)}
                            </Badge>
                        )}
                    </div>
                    <Link to={profileUrl} className="block text-sm text-muted-foreground hover:text-primary transition-colors leading-tight">@{user.username}</Link>
                    <div className="text-xs text-muted-foreground leading-tight">{user.email}</div>
                    {user.phoneNumber && (
                        <div className="text-xs text-muted-foreground leading-tight">{user.phoneNumber}</div>
                    )}
                </div>

                <div className="flex flex-col gap-1 items-start min-w-0 sm:min-w-[130px] self-start row-span-2">
                    {ROLE_META.map((role) => {
                        const active = hasRole(user, role.key);
                        const clickable = role.assignable && !deleted;
                        return (
                            <Badge
                                key={role.key}
                                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                                    active ? role.activeClass : role.inactiveClass
                                } ${clickable ? "cursor-pointer hover:opacity-80" : "cursor-default"} ${deleted ? "opacity-40" : ""}`}
                                onClick={clickable ? () => onRoleToggle(user, role.key, active) : undefined}
                                title={deleted ? "Cannot modify a deleted account" : role.assignable ? (role.key === "ADMINISTRATOR" ? (active ? "Click to request Administrator revocation (requires founder approval)" : "Click to request Administrator role (requires founder approval)") : `Click to ${active ? "revoke" : "grant"} ${role.label}`) : "Cannot be changed here"}
                            >
                                {role.label}
                            </Badge>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 items-stretch min-w-0 sm:min-w-[100px] self-start row-span-2">
                    {isBanned ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUnban(user)}
                            disabled={deleted}
                            className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                        >
                            Unban
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onBan(user)}
                            disabled={deleted}
                            className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                        >
                            <Ban className="h-3 w-3 mr-1" /> Ban
                        </Button>
                    )}

                    <RestrictPopover
                        user={user}
                        onRestrict={onRestrict}
                        onUnrestrict={onUnrestrict}
                        disabled={deleted}
                    />

                    <ClearProfilePopover
                        user={user}
                        onClear={onClear}
                        disabled={deleted}
                    />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 pt-1.5 border-t border-border">
                    {stats.map((s) => (
                        <span key={s.label} className="text-xs text-muted-foreground">
                            {s.href ? (
                                s.value > 0 ? (
                                    <Link to={s.href} className="inline group">
                                        <span className="font-medium text-foreground group-hover:text-primary">{s.value}</span>{" "}
                                        <span className="text-muted-foreground group-hover:text-primary">{s.label}</span>
                                    </Link>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip open={openZeroTooltipLabel === s.label} onOpenChange={(open) => setOpenZeroTooltipLabel(open ? s.label : null)}>
                                            <TooltipTrigger asChild>
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    className="cursor-pointer inline group"
                                                    onClick={(e) => { e.preventDefault(); setOpenZeroTooltipLabel(s.label); }}
                                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenZeroTooltipLabel(s.label); } }}
                                                >
                                                    <span className="font-medium text-foreground group-hover:text-primary">{s.value}</span>{" "}
                                                    <span className="text-muted-foreground group-hover:text-primary">{s.label}</span>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                No {s.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )
                            ) : (
                                <>
                                    <span className="font-medium text-foreground">{s.value}</span> {s.label}
                                </>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    );
});
