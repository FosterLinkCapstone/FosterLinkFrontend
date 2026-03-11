import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { PageLayout } from "../components/PageLayout";
import { useAuth } from "../backend/AuthContext";
import { userApi } from "../backend/api/UserApi";
import type { AdminUserModel } from "../backend/models/AdminUserModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paginator } from "../components/Paginator";
import { StatusDialog } from "../components/StatusDialog";
import { confirm } from "../components/ConfirmDialog";
import { Search, Trash2 } from "lucide-react";
import type { AdminUserStatsModel, GetAdminUsersResponse } from "../backend/models/AdminUserModel";
import { UserCard } from "../components/admin-users/UserCard";
import { ROLE_META, type SearchBy, type RoleKey } from "../components/admin-users/AdminRoleConstants";

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

    const handleRoleToggle = async (user: AdminUserModel, key: RoleKey, current: boolean) => {
        const meta = ROLE_META.find(r => r.key === key);

        if (key === "ADMINISTRATOR") {
            if (current) {
                const confirmed = await confirm({
                    message: `Request to revoke administrator role from @${user.username}? This will send approval emails to site developers. The role will only be revoked after approval.`,
                });
                if (!confirmed) return;

                const res = await apiRef.current.requestRevokeAdminRole(user.id);
                if (!res.isError) {
                    setStatusMsg({
                        msg: `Revocation request sent. The Administrator role for @${user.username} will only be removed after additional approval.`,
                        success: true,
                    });
                } else {
                    setStatusMsg({ msg: res.error ?? "Failed to send revocation request.", success: false });
                }
                return;
            }
            const confirmed = await confirm({
                message: `Request administrator role for @${user.username}? This will send approval emails to site developers. The role will only be granted after approval.`,
            });
            if (!confirmed) return;

            const res = await apiRef.current.requestAdminRole(user.id);
            if (!res.isError) {
                setStatusMsg({
                    msg: `Approval request sent. The Administrator role for @${user.username} requires additional approval before it is granted.`,
                    success: true,
                });
            } else {
                setStatusMsg({ msg: res.error ?? "Failed to send approval request.", success: false });
            }
            return;
        }

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

                {/* Stats Bar */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-6 text-sm text-muted-foreground">
                    {stats ? (
                        <>
                            <button type="button" onClick={() => handleStatClick("ALL")} className="hover:text-primary transition-colors cursor-pointer" title="Show all users">
                                <span className="font-semibold text-foreground">{stats.totalUsers.toLocaleString()}</span> total users
                            </button>
                            <button type="button" onClick={() => handleStatClick("ADMINISTRATOR")} className="hover:text-primary transition-colors cursor-pointer" title="Filter by Administrator role">
                                <span className="font-semibold text-foreground">{stats.totalAdministrators.toLocaleString()}</span> administrators
                            </button>
                            <button type="button" onClick={() => handleStatClick("FAQ_AUTHOR")} className="hover:text-primary transition-colors cursor-pointer" title="Filter by FAQ Author role">
                                <span className="font-semibold text-foreground">{stats.totalFaqAuthors.toLocaleString()}</span> FAQ authors
                            </button>
                            <button type="button" onClick={() => handleStatClick("AGENCY_REP")} className="hover:text-primary transition-colors cursor-pointer" title="Filter by Agency Rep role">
                                <span className="font-semibold text-foreground">{stats.totalAgents.toLocaleString()}</span> agents
                            </button>
                            <button type="button" onClick={() => handleStatClick("DELETED")} className="hover:text-primary transition-colors cursor-pointer" title="Show deleted accounts">
                                <span className="font-semibold text-foreground">{stats.totalDeletedAccounts.toLocaleString()}</span> deleted accounts
                            </button>
                        </>
                    ) : (
                        <span className="h-4 w-64 rounded bg-muted/50 animate-pulse inline-block" />
                    )}
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
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
