import { useEffect, useRef, useState } from "react"
import type { AgencyModel } from "@/net-fosterlink/backend/models/AgencyModel"
import { agencyApi } from "@/net-fosterlink/backend/api/AgencyApi"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { AlertCircleIcon } from "lucide-react"
import { AgencyCard } from "./AgencyCard"
import { Button } from "@/components/ui/button"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Paginator } from "@/net-fosterlink/components/Paginator"
import { confirm } from "@/net-fosterlink/components/ConfirmDialog"

export const HiddenAgenciesTab = () => {
    const auth = useAuth()
    const agencyApiRef = useRef(agencyApi(auth))
    agencyApiRef.current = agencyApi(auth)

    const [agencies, setAgencies] = useState<AgencyModel[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [changeSuccess, setChangeSuccess] = useState<"restore" | "delete" | null>(null)

    useEffect(() => {
        setLoading(true)
        agencyApiRef.current.getHiddenAgencies(0).then(res => {
            if (!res.isError && res.data) {
                setAgencies(res.data.agencies)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                setError(null)
            } else {
                setAgencies([])
                setTotalPages(0)
                setError(res.error ?? "Failed to fetch hidden agencies")
            }
        }).finally(() => setLoading(false))
    }, [])

    const handleRestore = async (id: number) => {
        const confirmed = await confirm({
            message: "Are you sure you want to restore this agency? It will become visible to all users.",
        })
        if (confirmed) {
            agencyApiRef.current.hideAgency(id, false).then(res => {
                if (!res.isError) {
                    setAgencies(prev => prev.filter(a => a.id !== id))
                    setChangeSuccess("restore")
                } else {
                    setError(res.error ?? "Failed to restore agency")
                }
            })
        }
    }

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            message: "Are you sure you want to permanently delete this agency? It will not be recoverable.",
        })
        if (confirmed) {
            agencyApiRef.current.deleteHiddenAgency(id).then(res => {
                if (!res.isError) {
                    setAgencies(prev => prev.filter(a => a.id !== id))
                    setChangeSuccess("delete")
                } else {
                    setError(res.error ?? "Failed to delete agency")
                }
            })
        }
    }

    return (
        <>
            <StatusDialog
                open={changeSuccess != null}
                onOpenChange={() => setChangeSuccess(null)}
                title={`Successfully ${changeSuccess === "restore" ? "restored" : "deleted"} agency`}
                subtext=""
                isSuccess={true}
            />
            <StatusDialog
                open={error != null && agencies.length > 0}
                onOpenChange={() => setError(null)}
                title="Could not update agency"
                subtext={error ?? "An unknown error occurred"}
                isSuccess={false}
            />

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                </div>
            ) : agencies.length === 0 ? (
                <>
                    <p className="text-center text-muted-foreground py-12">No hidden agencies found.</p>
                    {error && <p className="text-center text-destructive">{error}</p>}
                </>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    {agencies.map(a => (
                        <div key={a.id} className="flex flex-col w-full gap-1">
                            <Alert className="bg-red-200 text-red-900 border-red-300 dark:bg-red-900/50 dark:text-red-100 dark:border-red-400/70" variant="destructive">
                                <AlertCircleIcon />
                                <AlertTitle>Hidden by {a.hiddenByUsername}</AlertTitle>
                            </Alert>
                            <AgencyCard onRemove={() => { return }} agency={a} showRemove={false} />
                            <div className="w-full flex flex-col mt-1 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleRestore(a.id)}
                                    className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/50 dark:text-emerald-50 dark:border-emerald-400/70 hover:bg-emerald-200 dark:hover:bg-emerald-500/70"
                                >
                                    Restore
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDelete(a.id)}
                                    className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Paginator<AgencyModel[]>
                        pageCount={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onDataChanged={setAgencies}
                        onPageChanged={async (pageNum) => {
                            const res = await agencyApiRef.current.getHiddenAgencies(pageNum - 1)
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
