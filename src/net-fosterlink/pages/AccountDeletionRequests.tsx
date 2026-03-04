import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Navbar } from "../components/Navbar"
import { useAuth } from "../backend/AuthContext"
import { accountDeletionApi } from "../backend/api/AccountDeletionApi"
import type { AccountDeletionRequestModel } from "../backend/models/AccountDeletionRequestModel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paginator } from "../components/Paginator"
import { StatusDialog } from "../components/StatusDialog"
import { confirm } from "../components/ConfirmDialog"
import { DelayDialog } from "../components/account-deletion/DelayDialog"
import { getInitials } from "../util/StringUtil"
import { buildProfileUrl } from "../util/UserUtil"
import { Trash2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

type SortBy = "recency" | "urgency"

const formatDateTime = (date: Date | string) => {
    const d = new Date(date)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

const thirtyDaysFromNow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
}

const isUrgent = (autoApproveBy: Date | string) => {
    const daysLeft = (new Date(autoApproveBy).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return daysLeft <= 7
}

const RequestCard = ({
    req,
    onApprove,
    onDelay,
}: {
    req: AccountDeletionRequestModel
    onApprove: (req: AccountDeletionRequestModel) => void
    onDelay: (req: AccountDeletionRequestModel) => void
}) => {
    const navigate = useNavigate()
    const [showFullNote, setShowFullNote] = useState(false)
    const urgent = isUrgent(req.autoApproveBy)
    const hasDelayNote = !!req.delayNote

    return (
        <Card className={`overflow-hidden border ${urgent ? "border-red-300 dark:border-red-700" : "border-border"}`}>
            {/* Header: requested at */}
            <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between ${urgent ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" : "bg-muted/40 text-muted-foreground"}`}>
                <span className="flex items-center gap-1">
                    {urgent && <AlertCircle className="h-3 w-3" />}
                    Requested at {formatDateTime(req.requestedAt)}
                </span>
                {req.clearAccount && (
                    <Badge variant="outline" className="text-xs border-destructive text-destructive dark:border-red-400 dark:text-red-400">
                        Account will clear
                    </Badge>
                )}
            </div>

            {/* Body: user info + delay note + buttons */}
            <div className="p-4 flex flex-col sm:flex-row gap-4">
                {/* User info */}
                <div
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                    onClick={() => navigate(buildProfileUrl(req.requestedBy))}
                    title="View user profile"
                >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={req.requestedBy.profilePictureUrl} alt={req.requestedBy.username} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(req.requestedBy.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="font-semibold truncate">{req.requestedBy.fullName}</div>
                        <div className="text-sm text-muted-foreground truncate">@{req.requestedBy.username}</div>
                    </div>
                </div>

                {/* Delay note (truncated) */}
                {hasDelayNote && (
                    <div className="flex-1 min-w-0">
                        <div
                            className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md p-2 cursor-pointer"
                            onClick={() => setShowFullNote(!showFullNote)}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Delay note</span>
                                {showFullNote
                                    ? <ChevronUp className="h-3 w-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                    : <ChevronDown className="h-3 w-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                }
                            </div>
                            <p className={`text-amber-800 dark:text-amber-200 ${showFullNote ? "" : "line-clamp-2"}`}>
                                {req.delayNote}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0 sm:w-28">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(req)}
                        className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/30 dark:text-red-200 dark:border-red-500/50 hover:bg-red-200 dark:hover:bg-red-500/50"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelay(req)}
                        className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        Delay
                    </Button>
                </div>
            </div>

            {/* Footer: auto approve by */}
            <div className={`px-4 py-2 text-xs border-t ${urgent ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 text-red-600 dark:text-red-400" : "border-border bg-muted/20 text-muted-foreground"}`}>
                Will auto approve at {formatDateTime(req.autoApproveBy)}
            </div>
        </Card>
    )
}

export const AccountDeletionRequests = () => {
    const auth = useAuth()
    const apiRef = useRef(accountDeletionApi(auth))
    apiRef.current = accountDeletionApi(auth)

    const [requests, setRequests] = useState<AccountDeletionRequestModel[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [sortBy, setSortBy] = useState<SortBy>("recency")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorDialogMsg, setErrorDialogMsg] = useState<string | null>(null)

    const [delayTarget, setDelayTarget] = useState<AccountDeletionRequestModel | null>(null)
    const [delayLoading, setDelayLoading] = useState(false)

    const loadPage = async (page: number, sort: SortBy) => {
        const res = await apiRef.current.getRequests(page - 1, sort)
        if (!res.isError && res.data) {
            setTotalPages(res.data.totalPages)
            return res.data.requests
        }
        return []
    }

    useEffect(() => {
        setLoading(true)
        apiRef.current.getRequests(0, sortBy).then(res => {
            if (!res.isError && res.data) {
                setRequests(res.data.requests)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                setError(null)
            } else {
                setError(res.error ?? "Failed to load deletion requests")
            }
        }).finally(() => setLoading(false))
    }, [sortBy])

    const handleApprove = async (req: AccountDeletionRequestModel) => {
        const confirmed = await confirm({
            message: `Are you sure you want to approve the deletion request for "${req.requestedBy.fullName}" (@${req.requestedBy.username})? The account will be permanently anonymized${req.clearAccount ? " and all associated content will be deleted" : ""}. This cannot be undone.`,
        })
        if (!confirmed) return
        const res = await apiRef.current.approveRequest(req.id)
        if (!res.isError) {
            setRequests(prev => prev.filter(r => r.id !== req.id))
            setSuccessMsg("Deletion request approved. The account has been anonymized.")
        } else {
            setErrorDialogMsg(res.error ?? "Failed to approve deletion request.")
        }
    }

    const handleDelay = (req: AccountDeletionRequestModel) => {
        setDelayTarget(req)
    }

    const handleDelayConfirm = async (reason: string) => {
        if (!delayTarget) return
        setDelayLoading(true)
        const res = await apiRef.current.delayRequest(delayTarget.id, reason)
        setDelayLoading(false)
        setDelayTarget(null)
        if (!res.isError) {
            setSuccessMsg("Deletion request delayed by 30 days.")
            // Re-fetch current page to reflect updated autoApproveBy
            loadPage(currentPage, sortBy).then(updated => setRequests(updated))
        } else {
            setErrorDialogMsg(res.error ?? "Failed to delay deletion request.")
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-background border-b border-border h-16 flex items-center justify-center">
                <Navbar userInfo={auth.getUserInfo()} />
            </div>

            <StatusDialog
                open={!!successMsg}
                onOpenChange={() => setSuccessMsg(null)}
                title={successMsg ?? ""}
                subtext=""
                isSuccess={true}
            />
            <StatusDialog
                open={!!errorDialogMsg}
                onOpenChange={() => setErrorDialogMsg(null)}
                title="Action failed"
                subtext={errorDialogMsg ?? ""}
                isSuccess={false}
            />

            <DelayDialog
                open={!!delayTarget}
                onOpenChange={(open) => { if (!open) setDelayTarget(null) }}
                newAutoApproveBy={thirtyDaysFromNow()}
                onConfirm={handleDelayConfirm}
                loading={delayLoading}
            />

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Account Deletion Requests</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Requests auto-approve after 30 days if not acted on.
                        </p>
                    </div>
                    <div className="w-48">
                        <Select
                            value={sortBy}
                            onValueChange={(val: SortBy) => setSortBy(val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground">
                                <SelectItem value="recency">Newest first</SelectItem>
                                <SelectItem value="urgency">Most urgent first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                    </div>
                ) : error && requests.length === 0 ? (
                    <div className="text-center text-destructive py-16">{error}</div>
                ) : requests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-16">No pending deletion requests.</p>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <RequestCard
                                key={req.id}
                                req={req}
                                onApprove={handleApprove}
                                onDelay={handleDelay}
                            />
                        ))}
                        <Paginator<AccountDeletionRequestModel[]>
                            pageCount={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            onDataChanged={setRequests}
                            onPageChanged={async (pageNum) => {
                                const res = await apiRef.current.getRequests(pageNum - 1, sortBy)
                                if (res.data) {
                                    setTotalPages(res.data.totalPages)
                                    return res.data.requests
                                }
                                return []
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
