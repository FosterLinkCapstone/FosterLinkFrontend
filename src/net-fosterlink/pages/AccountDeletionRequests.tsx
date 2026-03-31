import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { PageLayout } from "../components/PageLayout"
import { useAuth } from "../backend/AuthContext"
import { accountDeletionApi } from "../backend/api/AccountDeletionApi"
import type { AccountDeletionRequestModel } from "../backend/models/AccountDeletionRequestModel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Paginator } from "../components/Paginator"
import { StatusDialog } from "../components/StatusDialog"
import { confirm } from "../components/ConfirmDialog"
import { DelayDialog } from "../components/account-deletion/DelayDialog"
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"
import { getInitials } from "../util/StringUtil"
import { buildProfileUrl } from "../util/UserUtil"
import { Trash2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { formatDate } from "../util/DateUtil"

type SortBy = "recency" | "urgency"

const formatDateTime = (date: Date | string) => {
    const d = new Date(date)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

const thirtyDaysFromNow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
}

const getDaysLeft = (autoApproveBy: Date | string) => {
    const diff = (new Date(autoApproveBy).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(diff))
}

const isUrgent = (autoApproveBy: Date | string) => getDaysLeft(autoApproveBy) <= 7

const RequestCard = ({
    req,
    onApprove,
    onDelay,
    approving,
    highlighted,
    cardRef,
}: {
    req: AccountDeletionRequestModel
    onApprove: (req: AccountDeletionRequestModel) => void
    onDelay: (req: AccountDeletionRequestModel) => void
    approving: boolean
    highlighted?: boolean
    cardRef?: React.Ref<HTMLDivElement>
}) => {
    const navigate = useNavigate()
    const [showFullNote, setShowFullNote] = useState(false)
    const urgent = isUrgent(req.autoApproveBy)
    const daysLeft = getDaysLeft(req.autoApproveBy)
    const hasDelayNote = !!req.delayNote

    return (
        <div ref={cardRef} className={`flex flex-col w-full gap-1 rounded-lg transition-all duration-300 ${highlighted ? "ring-2 ring-primary ring-offset-2" : ""}`}>
            {urgent && (
                <Alert className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70" variant="destructive">
                    <AlertCircle />
                    <AlertTitle>
                        Urgent — auto-approves in {daysLeft} {daysLeft === 1 ? "day" : "days"}
                    </AlertTitle>
                </Alert>
            )}

            {hasDelayNote && (
                <Alert className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700">
                    <Clock />
                    <AlertTitle>
                        Previously delayed{req.reviewedBy ? ` by ${req.reviewedBy.username}` : ""}
                    </AlertTitle>
                </Alert>
            )}

            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div
                    className="p-4 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(buildProfileUrl(req.requestedBy))}
                    title="View user profile"
                >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={req.requestedBy.profilePictureUrl} alt={req.requestedBy.username} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(req.requestedBy.fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{req.requestedBy.fullName}</div>
                        <div className="text-sm text-muted-foreground truncate">@{req.requestedBy.username}</div>
                    </div>
                    {req.clearAccount && (
                        <Badge variant="outline" className="text-xs border-destructive text-destructive dark:border-red-400 dark:text-red-400 flex-shrink-0">
                            Account will clear
                        </Badge>
                    )}
                </div>

                <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Requested {formatDateTime(req.requestedAt)}</span>
                    <span className={urgent ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                        Auto-approves {formatDate(req.autoApproveBy)}
                    </span>
                </div>

                {hasDelayNote && (
                    <div
                        className="px-4 py-2.5 border-t border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 cursor-pointer"
                        onClick={() => setShowFullNote(!showFullNote)}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Delay note</span>
                            {showFullNote
                                ? <ChevronUp className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                : <ChevronDown className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            }
                        </div>
                        {showFullNote && (
                            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                {req.delayNote}
                            </p>
                        )}
                    </div>
                )}
            </Card>

            <div className="w-full flex gap-2 mt-1">
                <Button
                    variant="outline"
                    onClick={() => onApprove(req)}
                    className="flex-1 bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                    disabled={approving}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Approve Deletion
                </Button>
                <Button
                    variant="outline"
                    onClick={() => onDelay(req)}
                    className="flex-1 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/50 dark:text-amber-50 dark:border-amber-400/70 hover:bg-amber-200 dark:hover:bg-amber-500/70"
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Delay
                </Button>
                <BackgroundLoadSpinner loading={approving} />
            </div>
        </div>
    )
}

export const AccountDeletionRequests = () => {
    const auth = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const highlightUserId = searchParams.get("userId") ? Number(searchParams.get("userId")) : null
    const apiRef = useRef(accountDeletionApi(auth))
    apiRef.current = accountDeletionApi(auth)

    const highlightRef = useRef<HTMLDivElement | null>(null)

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
    const [approvingId, setApprovingId] = useState<number | null>(null)

    const loadPage = async (page: number, sort: SortBy) => {
        const res = await apiRef.current.getRequests(page - 1, sort)
        if (!res.isError && res.data) {
            setTotalPages(res.data.totalPages)
            return res.data.items
        }
        return []
    }

    useEffect(() => {
        if (highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }, [requests])

    useEffect(() => {
        setLoading(true)
        apiRef.current.getRequests(0, sortBy).then(res => {
            if (!res.isError && res.data) {
                setRequests(res.data.items)
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
        setApprovingId(req.id)
        try {
            const res = await apiRef.current.approveRequest(req.id)
            if (!res.isError) {
                setRequests(prev => prev.filter(r => r.id !== req.id))
                setSuccessMsg("Deletion request approved. The account has been anonymized.")
            } else {
                setErrorDialogMsg(res.error ?? "Failed to approve deletion request.")
            }
        } finally {
            setApprovingId(null)
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
        <PageLayout auth={auth}>
            <title>Account Deletion Requests</title>

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

            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Account Deletion Requests</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Requests auto-approve after 30 days if not acted on.
                        </p>
                    </div>
                    <div className="w-full sm:w-48 flex-shrink-0">
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

                {searchParams.has("userId") && (
                    <Alert className="w-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700 mb-4" variant="default">
                        <AlertCircle />
                        <AlertTitle>You are currently viewing a single user. <a className="text-primary hover:text-primary/90 cursor-pointer font-medium" onClick={() => navigate("/admin/account-deletion-requests")}>Clear Selection</a></AlertTitle>
                    </Alert>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                    </div>
                ) : error && requests.length === 0 ? (
                    <div className="text-center text-destructive py-12">{error}</div>
                ) : requests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No pending deletion requests.</p>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        {requests.map(req => {
                            const isHighlighted = highlightUserId !== null && req.requestedBy.id === highlightUserId
                            return (
                            <RequestCard
                                key={req.id}
                                req={req}
                                onApprove={handleApprove}
                                onDelay={handleDelay}
                                approving={approvingId === req.id}
                                highlighted={isHighlighted}
                                cardRef={isHighlighted ? highlightRef : undefined}
                            />
                            )
                        })}
                        <Paginator<AccountDeletionRequestModel[]>
                            pageCount={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            onDataChanged={setRequests}
                            onPageChanged={async (pageNum) => {
                                const res = await apiRef.current.getRequests(pageNum - 1, sortBy)
                                if (res.data) {
                                    setTotalPages(res.data.totalPages)
                                    return res.data.items
                                }
                                return []
                            }}
                        />
                    </div>
                )}
            </div>
        </PageLayout>
    )
}
