import { useEffect, useRef, useState } from "react"
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel"
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { AgencyCard } from "./AgencyCard"
import { Button } from "@/components/ui/button"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Paginator } from "@/net-fosterlink/components/Paginator"
import { confirm } from "@/net-fosterlink/components/ConfirmDialog"

export const PendingAgenciesTab = () => {
    const auth = useAuth()
    const agencyApiRef = useRef(agencyApi(auth))
    agencyApiRef.current = agencyApi(auth)

    const [agencies, setAgencies] = useState<AgencyModel[] | null>(null)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [approvedOrDenied, setApprovedOrDenied] = useState('')
    const [isError, setIsError] = useState<boolean>(false)
    const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    useEffect(() => {
        agencyApiRef.current.getPending(0).then(res => {
            if (!res.isError && res.data) {
                setAgencies(res.data.agencies)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
            }
        })
    }, [])

    const onApprove = (id: number, approve: boolean) => {
        agencyApiRef.current.approve(id, approve).then(res => {
            if (!res.isError && res.data) {
                if (approve) {
                    setAgencies(agencies?.filter(a => a.id !== id) ?? [])
                } else {
                    setAgencies(agencies?.map(a => {
                        if (a.id === id) {
                            a.approved = 3
                            a.approvedByUsername = auth.getUserInfo()!.username
                            return a
                        } else return a
                    }) ?? [])
                }
                setApprovedOrDenied(approve ? "approved" : "denied")
            } else {
                setIsError(true)
            }
        })
    }

    const onFullDelete = async (id: number) => {
        const confirmed = await confirm({
            message: "Permanently delete this agency? This cannot be undone.",
        })
        if (confirmed) {
            agencyApiRef.current.deleteHiddenAgency(id).then(res => {
                if (!res.isError) {
                    setAgencies(prev => prev?.filter(a => a.id !== id) ?? [])
                    setDeleteSuccess(true)
                } else {
                    setDeleteError(res.error ?? "Failed to delete agency")
                }
            })
        }
    }

    if (agencies == null) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <StatusDialog
                open={approvedOrDenied != ''}
                onOpenChange={() => setApprovedOrDenied('')}
                title={`Successfully ${approvedOrDenied} agency`}
                subtext=""
                isSuccess={true}
            />
            <StatusDialog
                open={isError}
                onOpenChange={() => setIsError(false)}
                title="Could not update agency!"
                subtext="Please try again later"
                isSuccess={false}
            />
            <StatusDialog
                open={deleteSuccess}
                onOpenChange={() => setDeleteSuccess(false)}
                title="Agency permanently deleted"
                subtext=""
                isSuccess={true}
            />
            <StatusDialog
                open={deleteError != null}
                onOpenChange={() => setDeleteError(null)}
                title="Could not delete agency"
                subtext={deleteError ?? ""}
                isSuccess={false}
            />

            {agencies.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No pending agencies.</p>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    {agencies.map(a => (
                        <div key={a.id} className="flex flex-col w-full gap-1">
                            {a.approved === 3 && (
                                <Alert className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70" variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>Denied by {a.approvedByUsername}</AlertTitle>
                                </Alert>
                            )}
                            <AgencyCard onRemove={() => { return }} agency={a} showRemove={false} />
                            <div className="w-full flex flex-col mt-1 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => onApprove(a.id, true)}
                                    className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/50 dark:text-emerald-50 dark:border-emerald-400/70 hover:bg-emerald-200 dark:hover:bg-emerald-500/70"
                                >
                                    Approve
                                </Button>
                                {a.approved !== 3 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onApprove(a.id, false)}
                                        className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                                    >
                                        Deny
                                    </Button>
                                )}
                                {a.approved === 3 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => onFullDelete(a.id)}
                                        className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                    <Paginator<AgencyModel[]>
                        pageCount={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onDataChanged={setAgencies}
                        onPageChanged={async (pageNum) => {
                            const res = await agencyApiRef.current.getPending(pageNum - 1)
                            if (res.data) {
                                setTotalPages(res.data.totalPages)
                                return res.data.agencies
                            }
                            return []
                        }}
                    />
                </div>
            )}
        </>
    )
}
