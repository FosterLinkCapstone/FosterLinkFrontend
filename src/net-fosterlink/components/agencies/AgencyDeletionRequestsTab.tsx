import { useEffect, useRef, useState } from "react"
import type { AgencyDeletionRequestModel } from "@/net-fosterlink/backend/models/AgencyDeletionRequestModel"
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { AlertCircle, Clock, Trash2 } from "lucide-react"
import { AgencyCard } from "./AgencyCard"
import { Button } from "@/components/ui/button"
import { BackgroundLoadSpinner } from "@/net-fosterlink/components/BackgroundLoadSpinner"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Paginator } from "@/net-fosterlink/components/Paginator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { confirm } from "@/net-fosterlink/components/ConfirmDialog"
import { DelayDialog } from "@/net-fosterlink/components/account-deletion/DelayDialog"
import { formatDate } from "@/net-fosterlink/util/DateUtil"

type SortBy = "recency" | "urgency"

const getDaysLeft = (autoApproveBy: Date | string) => {
    const diff = (new Date(autoApproveBy).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.ceil(diff))
}

const isUrgent = (autoApproveBy: Date | string) => getDaysLeft(autoApproveBy) <= 7

const thirtyDaysFromNow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
}

const RequestGroup = ({
    req,
    onApprove,
    onDelay,
    approving,
}: {
    req: AgencyDeletionRequestModel
    onApprove: (req: AgencyDeletionRequestModel) => void
    onDelay: (req: AgencyDeletionRequestModel) => void
    approving: boolean
}) => {
    const [showFullNote, setShowFullNote] = useState(false)
    const urgent = isUrgent(req.autoApproveBy)
    const daysLeft = getDaysLeft(req.autoApproveBy)
    const hasDelayNote = !!req.delayNote

    return (
        <div className="w-full rounded-xl border shadow-sm overflow-hidden">
            {/* Card 1: Agency preview */}
            <AgencyCard onRemove={() => { return }} agency={req.agency} showRemove={false} />

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Card 2: Action panel */}
            <div className="bg-card">
                {urgent && (
                    <Alert className="rounded-none border-0 border-b bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70" variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>
                            Urgent — auto-approves in {daysLeft} {daysLeft === 1 ? "day" : "days"}
                        </AlertTitle>
                    </Alert>
                )}

                {hasDelayNote && (
                    <Alert
                        className="rounded-none border-0 border-b bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700 cursor-pointer"
                        onClick={() => setShowFullNote(!showFullNote)}
                    >
                        <Clock className="size-4" />
                        <AlertTitle>
                            Previously delayed{req.reviewedBy ? ` by ${req.reviewedBy.username}` : ""}
                        </AlertTitle>
                        {showFullNote && req.delayNote && (
                            <p className="col-start-2 mt-1 text-sm text-amber-800 dark:text-amber-200 font-normal">
                                {req.delayNote}
                            </p>
                        )}
                    </Alert>
                )}

                <div className="px-4 py-2.5 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-sm text-muted-foreground border-b border-border bg-muted/30">
                    <span>Requested by <span className="font-medium text-foreground">@{req.requestedBy.username}</span> on {formatDate(req.createdAt)}</span>
                    <span className={urgent ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                        Auto-approves {formatDate(req.autoApproveBy)}
                    </span>
                </div>

                <div className="px-4 py-3 flex gap-2">
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
                        disabled={approving}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Delay
                    </Button>
                    <BackgroundLoadSpinner loading={approving} />
                </div>
            </div>
        </div>
    )
}

export const AgencyDeletionRequestsTab = () => {
    const auth = useAuth()
    const agencyApiRef = useRef(agencyApi(auth))
    agencyApiRef.current = agencyApi(auth)

    const [requests, setRequests] = useState<AgencyDeletionRequestModel[]>([])
    const [sortBy, setSortBy] = useState<SortBy>("recency")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [errorDialogMsg, setErrorDialogMsg] = useState<string | null>(null)

    const [delayTarget, setDelayTarget] = useState<AgencyDeletionRequestModel | null>(null)
    const [delayLoading, setDelayLoading] = useState(false)
    const [approvingId, setApprovingId] = useState<number | null>(null)

    const loadPage = async (page: number, sort: SortBy) => {
        const res = await agencyApiRef.current.getDeletionRequests(page - 1, sort)
        if (!res.isError && res.data) {
            setTotalPages(res.data.totalPages)
            return res.data.items
        }
        return []
    }

    useEffect(() => {
        setLoading(true)
        agencyApiRef.current.getDeletionRequests(0, sortBy).then(res => {
            if (!res.isError && res.data) {
                setRequests(res.data.items)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                setError(null)
            } else {
                setRequests([])
                setTotalPages(0)
                setError(res.error ?? "Failed to fetch deletion requests")
            }
        }).finally(() => setLoading(false))
    }, [sortBy])

    const handleApprove = async (req: AgencyDeletionRequestModel) => {
        const confirmed = await confirm({
            message: `Are you sure you want to approve this deletion request? The agency "${req.agency.agencyName}" will be permanently deleted and cannot be recovered.`,
        })
        if (!confirmed) return
        setApprovingId(req.id)
        try {
            const res = await agencyApiRef.current.approveDeletionRequest(req.id)
            if (!res.isError) {
                setRequests(prev => prev.filter(r => r.id !== req.id))
                setSuccessMsg("Deletion request approved — agency deleted.")
            } else {
                setErrorDialogMsg(res.error ?? "Failed to approve deletion request.")
            }
        } finally {
            setApprovingId(null)
        }
    }

    const handleDelay = (req: AgencyDeletionRequestModel) => {
        setDelayTarget(req)
    }

    const handleDelayConfirm = async (reason: string) => {
        if (!delayTarget) return
        setDelayLoading(true)
        const res = await agencyApiRef.current.delayDeletionRequest(delayTarget.id, reason)
        setDelayLoading(false)
        setDelayTarget(null)
        if (!res.isError) {
            setSuccessMsg("Deletion request delayed by 30 days.")
            loadPage(currentPage, sortBy).then(updated => setRequests(updated))
        } else {
            setErrorDialogMsg(res.error ?? "Failed to delay deletion request.")
        }
    }

    return (
        <>
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
                title="Why are you delaying the deletion of this agency?"
            />

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <>
                    <p className="text-center text-muted-foreground py-12">No pending deletion requests.</p>
                    {error && <p className="text-center text-destructive">{error}</p>}
                </>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    <div className="w-full">
                        <Select value={sortBy} onValueChange={(val: SortBy) => setSortBy(val)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground">
                                <SelectItem value="recency">Newest first</SelectItem>
                                <SelectItem value="urgency">Most urgent first</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {requests.map(req => (
                        <RequestGroup
                            key={req.id}
                            req={req}
                            onApprove={handleApprove}
                            onDelay={handleDelay}
                            approving={approvingId === req.id}
                        />
                    ))}
                    <Paginator<AgencyDeletionRequestModel[]>
                        pageCount={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onDataChanged={setRequests}
                        onPageChanged={async (pageNum) => {
                            const res = await agencyApiRef.current.getDeletionRequests(pageNum - 1, sortBy)
                            if (res.data) {
                                setTotalPages(res.data.totalPages)
                                return res.data.items
                            }
                            return []
                        }}
                    />
                </div>
            )}
        </>
    )
}
