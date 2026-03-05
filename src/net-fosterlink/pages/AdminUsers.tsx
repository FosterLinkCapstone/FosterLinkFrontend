import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import type { AdminUserModel } from "../backend/models/AdminUserModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Paginator } from "../components/Paginator";
import { getInitials } from "../util/StringUtil";
import { StatusDialog } from "../components/StatusDialog";
import { confirm } from "../components/ConfirmDialog";
import { Ban, ShieldAlert, Search, Trash2 } from "lucide-react";
import type { AdminUserStatsModel, GetAdminUsersResponse } from "../backend/models/AdminUserModel";

// ─── Types ──────────────────────────────────────────────────────────────────

type SearchBy = "FULL_NAME" | "USERNAME" | "EMAIL" | "PHONE_NUMBER" | "ROLE";
type RoleKey = "ADMINISTRATOR" | "FAQ_AUTHOR" | "AGENCY_REP" | "VERIFIED_FOSTER" | "ID_VERIFIED";

interface RoleMeta {
    label: string;
    key: RoleKey;
    assignable: boolean;
    activeClass: string;
    inactiveClass: string;
}

const ROLE_META: RoleMeta[] = [
    {
        key: "ADMINISTRATOR",
        label: "Administrator",
        assignable: false,
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

function formatRestrictionInfo(restrictedUntil: string | null): string {
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

function hasRole(user: AdminUserModel, key: RoleKey): boolean {
    switch (key) {
        case "ADMINISTRATOR":    return user.administrator;
        case "FAQ_AUTHOR":       return user.faqAuthor;
        case "AGENCY_REP":       return user.verifiedAgencyRep;
        case "VERIFIED_FOSTER":  return user.verifiedFoster;
        case "ID_VERIFIED":      return user.idVerified;
    }
}

// ─── Restrict Popover ────────────────────────────────────────────────────────

interface RestrictPopoverProps {
    user: AdminUserModel;
    onRestrict: (userId: number, until?: string) => void;
    onUnrestrict: (userId: number) => void;
    disabled?: boolean;
}

const RestrictPopover = ({ user, onRestrict, onUnrestrict, disabled }: RestrictPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [forever, setForever] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const isRestricted = user.restrictedAt !== null;

    if (isRestricted) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => onUnrestrict(user.id)}
                disabled={disabled}
                className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
            >
                Unrestrict
            </Button>
        );
    }

    const handleConfirm = () => {
        const until = !forever && selectedDate
            ? selectedDate.toISOString().slice(0, 19)
            : undefined;
        onRestrict(user.id, until);
        setOpen(false);
        setForever(true);
        setSelectedDate(undefined);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className="text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Restrict
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-3" align="end">
                <p className="text-sm font-medium">Restrict until...</p>

                <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                    <input
                        type="checkbox"
                        checked={forever}
                        onChange={(e) => {
                            setForever(e.target.checked);
                            if (e.target.checked) setSelectedDate(undefined);
                        }}
                        className="rounded"
                    />
                    Forever (indefinite)
                </label>

                <div className={forever ? "opacity-40 pointer-events-none" : ""}>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date <= new Date()}
                    />
                </div>

                <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConfirm}
                    disabled={!forever && !selectedDate}
                >
                    Confirm Restriction
                </Button>
            </PopoverContent>
        </Popover>
    );
};

// ─── User Card ──────────────────────────────────────────────────────────────

interface UserCardProps {
    user: AdminUserModel;
    deleted?: boolean;
    onRoleToggle: (user: AdminUserModel, key: RoleKey, current: boolean) => void;
    onBan: (user: AdminUserModel) => void;
    onUnban: (user: AdminUserModel) => void;
    onRestrict: (userId: number, until?: string) => void;
    onUnrestrict: (userId: number) => void;
}

const UserCard = ({ user, deleted, onRoleToggle, onBan, onUnban, onRestrict, onUnrestrict }: UserCardProps) => {
    const isBanned = user.bannedAt !== null;
    const isRestricted = user.restrictedAt !== null;
    const fullName = `${user.firstName} ${user.lastName}`;

    const profileUrl = `/users/${user.id}?username=${encodeURIComponent(user.username)}&fullName=${encodeURIComponent(fullName)}${user.profilePictureUrl ? `&profilePicUrl=${encodeURIComponent(user.profilePictureUrl)}` : ""}`;

    const stats = [
        { label: "posts",        value: user.postCount },
        { label: "replies",      value: user.replyCount },
        { label: "agencies",     value: user.agencyCount },
        { label: "FAQ answers",  value: user.faqAnswerCount },
        { label: "FAQ suggestions", value: user.faqSuggestionCount },
    ];

    return (
        <Card className="p-4">
            <div className="grid gap-x-4" style={{ gridTemplateColumns: "auto 1fr auto auto" }}>
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

                <div className="flex flex-col gap-1 items-start min-w-[130px] self-start row-span-2">
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
                                title={deleted ? "Cannot modify a deleted account" : role.assignable ? `Click to ${active ? "revoke" : "grant"} ${role.label}` : "Cannot be changed here"}
                            >
                                {role.label}
                            </Badge>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-2 items-stretch min-w-[100px] self-start row-span-2">
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
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 pt-1.5 border-t border-border">
                    {stats.map((s) => (
                        <span key={s.label} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{s.value}</span> {s.label}
                        </span>
                    ))}
                </div>
            </div>
        </Card>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export const AdminUsers = () => {
    const auth = useAuth();
    const [searchParams] = useSearchParams();
    const apiRef = useRef(userApi(auth));
    apiRef.current = userApi(auth);

    const initialSearchBy = (searchParams.get("searchBy") as SearchBy | null) ?? "FULL_NAME";
    const initialQuery = searchParams.get("query") ?? "";

    const [searchBy, setSearchBy] = useState<SearchBy>(initialSearchBy);
    const [queryDraft, setQueryDraft] = useState(initialQuery);
    const [roleQuery, setRoleQuery] = useState<RoleKey>("ADMINISTRATOR");
    const [submittedSearchBy, setSubmittedSearchBy] = useState<SearchBy>(initialSearchBy);
    const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

    const [users, setUsers] = useState<AdminUserModel[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"ALL" | "SEARCH" | "DELETED">("ALL");

    const [stats, setStats] = useState<AdminUserStatsModel | null>(null);

    const [statusMsg, setStatusMsg] = useState<{ msg: string; success: boolean } | null>(null);

    const modeRef = useRef<"ALL" | "SEARCH" | "DELETED">("ALL");
    modeRef.current = mode;

    const doFetch = useCallback(async (page: number, fetchMode: "ALL" | "SEARCH" | "DELETED", by: SearchBy, q: string) => {
        setLoading(true);
        const res = fetchMode === "DELETED"
            ? await apiRef.current.getDeletedUsers(page - 1)
            : fetchMode === "ALL"
            ? await apiRef.current.getAllUsers(page - 1)
            : await apiRef.current.searchUsers(by, q, page - 1);
        setLoading(false);
        if (!res.isError && res.data) {
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to load users.", success: false });
            setUsers([]);
            setTotalPages(1);
        }
    }, []);

    // On mount: load stats + either run URL-param search or load all users
    useEffect(() => {
        apiRef.current.getUserStats().then((res) => {
            if (!res.isError && res.data) setStats(res.data);
        });
        if (initialQuery && initialSearchBy) {
            setMode("SEARCH");
            doFetch(1, "SEARCH", initialSearchBy, initialQuery);
        } else {
            doFetch(1, "ALL", initialSearchBy, "");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchBy === "ROLE" ? roleQuery : queryDraft.trim();
        if (!q) {
            setMode("ALL");
            modeRef.current = "ALL";
            setCurrentPage(1);
            doFetch(1, "ALL", searchBy, "");
            return;
        }
        setSubmittedSearchBy(searchBy);
        setSubmittedQuery(q);
        setCurrentPage(1);
        setMode("SEARCH");
        modeRef.current = "SEARCH";
        doFetch(1, "SEARCH", searchBy, q);
    };

    const handleStatClick = (action: "ALL" | "DELETED" | RoleKey) => {
        setCurrentPage(1);
        if (action === "ALL") {
            setMode("ALL");
            modeRef.current = "ALL";
            setSearchBy("FULL_NAME");
            setQueryDraft("");
            doFetch(1, "ALL", "FULL_NAME", "");
        } else if (action === "DELETED") {
            if (modeRef.current === "DELETED") {
                setMode("ALL");
                modeRef.current = "ALL";
                doFetch(1, "ALL", searchBy, "");
            } else {
                setMode("DELETED");
                modeRef.current = "DELETED";
                doFetch(1, "DELETED", searchBy, "");
            }
        } else {
            setSearchBy("ROLE");
            setRoleQuery(action);
            setSubmittedSearchBy("ROLE");
            setSubmittedQuery(action);
            setMode("SEARCH");
            modeRef.current = "SEARCH";
            doFetch(1, "SEARCH", "ROLE", action);
        }
    };

    const handleToggleDeleted = () => {
        if (modeRef.current === "DELETED") {
            setMode("ALL");
            modeRef.current = "ALL";
            setCurrentPage(1);
            doFetch(1, "ALL", searchBy, "");
        } else {
            setMode("DELETED");
            modeRef.current = "DELETED";
            setCurrentPage(1);
            doFetch(1, "DELETED", searchBy, "");
        }
    };

    const handlePageChange = useCallback(async (page: number): Promise<GetAdminUsersResponse> => {
        const res = modeRef.current === "DELETED"
            ? await apiRef.current.getDeletedUsers(page - 1)
            : modeRef.current === "ALL"
            ? await apiRef.current.getAllUsers(page - 1)
            : await apiRef.current.searchUsers(submittedSearchBy, submittedQuery, page - 1);
        if (!res.isError && res.data) {
            return res.data;
        }
        return { users: [], totalPages: 1 };
    }, [submittedSearchBy, submittedQuery]);

    // Role toggle
    const handleRoleToggle = async (user: AdminUserModel, key: RoleKey, current: boolean) => {
        const meta = ROLE_META.find(r => r.key === key);
        const action = current ? "revoke" : "grant";
        const confirmed = await confirm({
            message: `Are you sure you want to ${action} the ${meta?.label} role ${current ? "from" : "to"} @${user.username}?`,
        });
        if (!confirmed) return;

        const res = await apiRef.current.setUserRole(user.id, key, !current);
        if (!res.isError) {
            setUsers(prev => prev.map(u => {
                if (u.id !== user.id) return u;
                const updated = { ...u };
                switch (key) {
                    case "FAQ_AUTHOR":       updated.faqAuthor = !current; break;
                    case "AGENCY_REP":       updated.verifiedAgencyRep = !current; break;
                    case "VERIFIED_FOSTER":  updated.verifiedFoster = !current; break;
                    case "ID_VERIFIED":      updated.idVerified = !current; break;
                }
                return updated;
            }));
            setStatusMsg({ msg: `${meta?.label} role ${current ? "revoked from" : "granted to"} @${user.username}.`, success: true });
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to update role.", success: false });
        }
    };

    // Ban
    const handleBan = async (user: AdminUserModel) => {
        const confirmed = await confirm({ message: `Are you sure you want to ban @${user.username}? They will be locked out of their account.` });
        if (!confirmed) return;
        const res = await apiRef.current.banUser(user.id);
        if (!res.isError) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, bannedAt: new Date().toISOString() } : u));
            setStatusMsg({ msg: `@${user.username} has been banned.`, success: true });
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to ban user.", success: false });
        }
    };

    const handleUnban = async (user: AdminUserModel) => {
        const confirmed = await confirm({ message: `Are you sure you want to unban @${user.username}?` });
        if (!confirmed) return;
        const res = await apiRef.current.unbanUser(user.id);
        if (!res.isError) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, bannedAt: null } : u));
            setStatusMsg({ msg: `@${user.username} has been unbanned.`, success: true });
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to unban user.", success: false });
        }
    };

    // Restrict
    const handleRestrict = async (userId: number, until?: string) => {
        const user = users.find(u => u.id === userId);
        const confirmed = await confirm({
            message: `Are you sure you want to restrict @${user?.username}?${until ? "" : " This will be indefinite."}`,
        });
        if (!confirmed) return;
        const res = await apiRef.current.restrictUser(userId, until);
        if (!res.isError) {
            setUsers(prev => prev.map(u => u.id === userId
                ? { ...u, restrictedAt: new Date().toISOString(), restrictedUntil: until ?? null }
                : u));
            setStatusMsg({ msg: `@${user?.username} has been restricted.`, success: true });
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to restrict user.", success: false });
        }
    };

    const handleUnrestrict = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        const confirmed = await confirm({ message: `Are you sure you want to unrestrict @${user?.username}?` });
        if (!confirmed) return;
        const res = await apiRef.current.unrestrictUser(userId);
        if (!res.isError) {
            setUsers(prev => prev.map(u => u.id === userId
                ? { ...u, restrictedAt: null, restrictedUntil: null }
                : u));
            setStatusMsg({ msg: `@${user?.username} has been unrestricted.`, success: true });
        } else {
            setStatusMsg({ msg: res.error ?? "Failed to unrestrict user.", success: false });
        }
    };

    return (
        <PageLayout auth={auth}>
            <title>User Management</title>

            <StatusDialog
                open={!!statusMsg}
                onOpenChange={() => setStatusMsg(null)}
                title={statusMsg?.msg ?? ""}
                subtext=""
                isSuccess={statusMsg?.success ?? false}
            />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-1 text-center">User Management</h1>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6 text-sm text-muted-foreground">
                    {stats ? (
                        <>
                            <button
                                type="button"
                                onClick={() => handleStatClick("ALL")}
                                className="hover:text-primary transition-colors cursor-pointer"
                                title="Show all users"
                            >
                                <span className="font-semibold text-foreground">{stats.totalUsers.toLocaleString()}</span> total users
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatClick("ADMINISTRATOR")}
                                className="hover:text-primary transition-colors cursor-pointer"
                                title="Filter by Administrator role"
                            >
                                <span className="font-semibold text-foreground">{stats.totalAdministrators.toLocaleString()}</span> administrators
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatClick("FAQ_AUTHOR")}
                                className="hover:text-primary transition-colors cursor-pointer"
                                title="Filter by FAQ Author role"
                            >
                                <span className="font-semibold text-foreground">{stats.totalFaqAuthors.toLocaleString()}</span> FAQ authors
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatClick("AGENCY_REP")}
                                className="hover:text-primary transition-colors cursor-pointer"
                                title="Filter by Agency Rep role"
                            >
                                <span className="font-semibold text-foreground">{stats.totalAgents.toLocaleString()}</span> agents
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatClick("DELETED")}
                                className="hover:text-primary transition-colors cursor-pointer"
                                title="Show deleted accounts"
                            >
                                <span className="font-semibold text-foreground">{stats.totalDeletedAccounts.toLocaleString()}</span> deleted accounts
                            </button>
                        </>
                    ) : (
                        <span className="h-4 w-64 rounded bg-muted/50 animate-pulse inline-block" />
                    )}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Query input or role picker */}
                    {searchBy === "ROLE" ? (
                        <Select value={roleQuery} onValueChange={(v) => setRoleQuery(v as RoleKey)}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select a role..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground">
                                <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                                <SelectItem value="FAQ_AUTHOR">FAQ Author</SelectItem>
                                <SelectItem value="AGENCY_REP">Agency Rep</SelectItem>
                                <SelectItem value="VERIFIED_FOSTER">Foster Verified</SelectItem>
                                <SelectItem value="ID_VERIFIED">ID Verified</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter search text..."
                                value={queryDraft}
                                onChange={(e) => setQueryDraft(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}

                    {/* Search By selector */}
                    <Select value={searchBy} onValueChange={(v) => setSearchBy(v as SearchBy)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Search By" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground">
                            <SelectItem value="FULL_NAME">Full Name</SelectItem>
                            <SelectItem value="USERNAME">Username</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                            <SelectItem value="ROLE">Role</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button type="submit" variant="outline" className="whitespace-nowrap">
                        Search
                    </Button>

                    <Button
                        type="button"
                        variant={mode === "DELETED" ? "default" : "outline"}
                        className="whitespace-nowrap"
                        onClick={handleToggleDeleted}
                    >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Deleted Accounts
                    </Button>
                </form>

                {/* Results */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4 h-28 animate-pulse bg-muted/30" />
                        ))}
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center text-muted-foreground py-16">
                        {mode === "SEARCH"
                            ? "No users found matching your search."
                            : mode === "DELETED"
                            ? "No deleted accounts found."
                            : "No users found."}
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <div className="space-y-3">
                        {/* Column headers */}
                        <div
                            className="grid gap-x-4 px-4 pb-2 border-b border-border"
                            style={{ gridTemplateColumns: "48px 1fr 130px 100px" }}
                        >
                            <div />
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Info</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Roles</div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Actions</div>
                        </div>

                        {users.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                deleted={mode === "DELETED"}
                                onRoleToggle={handleRoleToggle}
                                onBan={handleBan}
                                onUnban={handleUnban}
                                onRestrict={handleRestrict}
                                onUnrestrict={handleUnrestrict}
                            />
                        ))}
                    </div>
                )}

                <Paginator<GetAdminUsersResponse>
                    pageCount={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onDataChanged={(data) => {
                        setUsers(data.users);
                        setTotalPages(data.totalPages);
                    }}
                    onPageChanged={handlePageChange}
                />
            </div>
        </PageLayout>
    );
};
