import { useEffect, useRef, useState } from "react"
import type { AgencyDeletionRequestModel } from "@/net-fosterlink/backend/models/AgencyDeletionRequestModel"
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { AlertCircleIcon } from "lucide-react"
import { AgencyCard } from "./AgencyCard"
import { Button } from "@/components/ui/button"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Paginator } from "@/net-fosterlink/components/Paginator"
import { confirm } from "@/net-fosterlink/components/ConfirmDialog"

const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const AgencyDeletionRequestsTab = () => {
    const auth = useAuth()
    const agencyApiRef = useRef(agencyApi(auth))
    agencyApiRef.current = agencyApi(auth)

    const [requests, setRequests] = useState<AgencyDeletionRequestModel[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [changeSuccess, setChangeSuccess] = useState<"accepted" | "denied" | null>(null)

    useEffect(() => {
        setLoading(true)
        agencyApiRef.current.getDeletionRequests(0).then(res => {
            if (!res.isError && res.data) {
                setRequests(res.data.requests)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                setError(null)
            } else {
                setRequests([])
                setTotalPages(0)
                setError(res.error ?? "Failed to fetch deletion requests")
            }
        }).finally(() => setLoading(false))
    }, [])

    const handleAccept = async (req: AgencyDeletionRequestModel) => {
        const confirmed = await confirm({
            message: `Are you sure you want to accept this deletion request? The agency "${req.agency.agencyName}" will be permanently deleted and cannot be recovered.`,
        })
        if (confirmed) {
            agencyApiRef.current.approveDeletionRequest(req.id, true).then(res => {
                if (!res.isError) {
                    setRequests(prev => prev.filter(r => r.id !== req.id))
                    setChangeSuccess("accepted")
                } else {
                    setError(res.error ?? "Failed to accept deletion request")
                }
            })
        }
    }

    /*const handleDeny = async (req: AgencyDeletionRequestModel) => { TODO see below
        const confirmed = await confirm({
            message: "Are you sure you want to deny this deletion request? The agency will remain active.",
        })
        if (confirmed) {
            agencyApiRef.current.approveDeletionRequest(req.id, false).then(res => {
                if (!res.isError) {
                    setRequests(prev => prev.filter(r => r.id !== req.id))
                    setChangeSuccess("denied")
                } else {
                    setError(res.error ?? "Failed to deny deletion request")
                }
            })
        }
    }*/

    return (
        <>
            <StatusDialog
                open={changeSuccess != null}
                onOpenChange={() => setChangeSuccess(null)}
                title={changeSuccess === "accepted" ? "Deletion request accepted — agency deleted" : "Deletion request denied"}
                subtext=""
                isSuccess={true}
            />
            <StatusDialog
                open={error != null && requests.length > 0}
                onOpenChange={() => setError(null)}
                title="Could not process deletion request"
                subtext={error ?? "An unknown error occurred"}
                isSuccess={false}
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
                    {requests.map(req => (
                        <div key={req.id} className="flex flex-col w-full gap-1">
                            <Alert className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700" variant="default">
                                <AlertCircleIcon />
                                <AlertTitle>
                                    Deletion requested by {req.requestedBy.username} on {formatDate(req.createdAt)}
                                </AlertTitle>
                            </Alert>
                            <AgencyCard onRemove={() => { return }} agency={req.agency} showRemove={false} />
                            <div className="w-full flex flex-col mt-1 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleAccept(req)}
                                    className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                                >
                                    Accept
                                </Button>
                                {/* TODO - privacy concerns with administrators being given too much power over agents being able to control their own agencies info */}
                                {/*<Button 
                                    variant="outline"
                                    onClick={() => handleDeny(req)}
                                    className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/50 dark:text-emerald-50 dark:border-emerald-400/70 hover:bg-emerald-200 dark:hover:bg-emerald-500/70"
                                >
                                    Deny (Keep Agency)
                                </Button>*/}
                            </div>
                        </div>
                    ))}
                    <Paginator<AgencyDeletionRequestModel[]>
                        pageCount={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onDataChanged={setRequests}
                        onPageChanged={async (pageNum) => {
                            const res = await agencyApiRef.current.getDeletionRequests(pageNum - 1)
                            if (res.data) {
                                setTotalPages(res.data.totalPages)
                                return res.data.requests
                            }
                            return []
                        }}
                    />
                </div>
            )}
        </>
    )
}
