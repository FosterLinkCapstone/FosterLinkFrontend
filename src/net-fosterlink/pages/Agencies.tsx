import { useEffect, useMemo, useState } from "react"
import { Paginator } from "../components/Paginator"
import type { AgencyModel } from "../backend/models/AgencyModel"
import { agencyApi } from "../backend/api/AgencyApi"
import { useAuth } from "../backend/AuthContext"
import { Navbar } from "../components/Navbar"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { AgencyCard } from "../components/agencies/AgencyCard"
import { Button } from "@/components/ui/button"
import { CreateAgencyCard } from "../components/agencies/CreateAgencyCard"
import type { CreateAgencyModel } from "../backend/models/api/CreateAgencyModel"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Link, useNavigate, useSearchParams } from "react-router"
import type { ErrorWrapper } from "../util/ErrorWrapper"
import { StatusDialog } from "../components/StatusDialog"
import { confirm } from "../components/ConfirmDialog"

export const Agencies = () => {
    const auth = useAuth()
    const [searchParams, _] = useSearchParams()
    const [agencies, setAgencies] = useState<AgencyModel[] | null>(null)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [pendingCount, setPendingCount] = useState(0)
    const [creatingAgency, setCreatingAgency] = useState<boolean>(false)
    const [createError, setCreateError] = useState<ErrorWrapper<AgencyModel> | null>(null)
    const [actionResult, setActionResult] = useState<{ success: boolean; title: string; subtext: string } | null>(null)
    const navigate = useNavigate()

    const highlightedAgencyId = useMemo(() => {
        if (!searchParams.has("agencyId")) return null
        const id = Number(searchParams.get("agencyId"))
        return Number.isNaN(id) ? null : id
    }, [searchParams])

    const agencyApiRef = useMemo(() => agencyApi(auth), [auth])
    useEffect(() => {
        agencyApiRef.getAll(0).then(res => {
            if (!res.isError && res.data) {
                setAgencies(res.data.agencies)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
            }
        })

    }, [])
    useEffect(() => {
        if (auth.agent && searchParams.has("creating")) {
            setCreatingAgency(searchParams.get("creating") === "true")
        }
    }, [auth.agent])
    useEffect(() => {
        if (auth.admin) {
            if (searchParams.has("creating")) {
                setCreatingAgency(searchParams.get("creating") === "true")
            }
            agencyApiRef.countPending().then(res => {
                if (!res.isError && res.data !== undefined) {
                    setPendingCount(res.data)
                }
            })
        }
    }, [auth.admin])

    const handleCreateAgency = async (agency: CreateAgencyModel) => {
        agencyApiRef.create(agency).then(res => {
            if (res.isError) {
                setCreateError(res)
            } else {
                setCreatingAgency(false)
                setActionResult({ success: true, title: "Successfully created agency!", subtext: "Awaiting review from an administrator." })
            }
        })
    }
    const onRemove = (agencyId: number) => {
        agencyApiRef.hideAgency(agencyId, true).then(res => {
            if (!res.isError && res.data) {
                setAgencies(agencies?.filter(a => a.id !== agencyId) ?? [])
                setActionResult({ success: true, title: "Successfully removed agency!", subtext: "" })
            } else {
                setActionResult({ success: false, title: "Could not remove agency!", subtext: res.error ?? "" })
            }
        })
    }

    const onRequestDeletion = (agencyId: number) => {
        agencyApiRef.requestDeletion(agencyId).then(res => {
            if (!res.isError) {
                const user = auth.getUserInfo()
                setAgencies(prev => prev?.map(a => a.id === agencyId && user
                    ? { ...a, deletionRequestedAt: new Date().toISOString(), deletionRequestedByUsername: user.username }
                    : a) ?? null)
                setActionResult({ success: true, title: "Deletion request submitted!", subtext: "An administrator will review your request." })
            } else {
                setActionResult({ success: false, title: "Could not submit deletion request!", subtext: res.error ?? "" })
            }
        })
    }

    const onCancelDeletionRequest = (agencyId: number) => {
        agencyApiRef.cancelDeletionRequest(agencyId).then(res => {
            if (!res.isError) {
                setAgencies(prev => prev?.map(a => a.id === agencyId
                    ? { ...a, deletionRequestedAt: undefined, deletionRequestedByUsername: undefined, deletionRequestId: undefined }
                    : a) ?? null)
            } else {
                setActionResult({ success: false, title: "Could not cancel deletion request!", subtext: res.error ?? "" })
            }
        })
    }

    const onAcceptDeletionRequest = async (agency: AgencyModel) => {
        if (agency.deletionRequestId == null) return
        const ok = await confirm({
            message: `Are you sure you want to accept this deletion request? The agency "${agency.agencyName}" will be permanently deleted and cannot be recovered.`,
        })
        if (!ok) return
        const res = await agencyApiRef.approveDeletionRequest(agency.deletionRequestId, true)
        if (!res.isError) {
            setAgencies(prev => prev?.filter(a => a.id !== agency.id) ?? [])
            setActionResult({ success: true, title: "Deletion request accepted — agency deleted", subtext: "" })
        } else {
            setActionResult({ success: false, title: "Could not accept deletion request", subtext: res.error ?? "" })
        }
    }


    return (
        <div className="min-h-screen bg-background">
            { createError &&
            <StatusDialog open={createError != null}
                onOpenChange={() => setCreateError(null)}
                title={`Could not create agency!`}
                subtext={createError?.error ?? ''}
                isSuccess={false}
            />
            }
            { actionResult &&
            <StatusDialog open={actionResult != null}
                onOpenChange={() => setActionResult(null)}
                title={actionResult.title}
                subtext={actionResult.subtext}
                isSuccess={actionResult.success}
            />
            }
            <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
                <Navbar userInfo={auth.getUserInfo()} />
            </div>
            {
                agencies == null ?
                    <div className="min-h-screen bg-background flex items-center justify-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                    :
                    <div className="w-screen h-full items-center justify-items-center">
                        <h1 className="text-3xl font-bold my-2 text-center">Agencies</h1>
                        <div className="w-7xl mx-auto h-full flex flex-col items-center gap-2 pb-3">
                            {
                                auth.admin &&
                                <Alert className='w-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700' variant="default">
                                    <AlertCircleIcon />
                                    <AlertTitle>There are {pendingCount} pending agencies. <Link className="text-primary hover:text-primary/90 font-medium" to="/agencies/pending">See more</Link></AlertTitle>
                                </Alert>
                            }
                            {
                                searchParams.has("agencyId") &&
                                <Alert className="w-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700" variant="default">
                                    <AlertCircleIcon/>
                                    <AlertTitle className="">You are currently viewing a single agency. <a className="text-primary hover:text-primary/90 cursor-pointer font-medium" onClick={() => navigate("/agencies")}>Clear Selection</a></AlertTitle>
                                    
                                </Alert>
                            }
                            {
                                ((auth.admin != null && auth.admin != null) && (auth.admin || auth.agent)) &&
                                <Button onClick={() => { setCreatingAgency(!creatingAgency) }} variant="outline" className="w-full my-4">Create a new agency</Button>
                            }
                            {
                                creatingAgency && <>
                                    <CreateAgencyCard
                                        handleSubmit={handleCreateAgency}
                                        handleClose={() => setCreatingAgency(false)}
                                        serverFieldErrors={createError?.validationErrors
                                            ? Object.fromEntries(createError.validationErrors.map(e => [e.field, e.message]))
                                            : undefined}
                                    />
                                </>
                            }
                            {agencies.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : agencies.filter(a => searchParams.has("agencyId") ? a.id === parseInt(searchParams.get("agencyId")!) : true).map(a => (
                                <div key={a.id} className="flex flex-col w-full gap-1">
                                    {a.deletionRequestedByUsername && (
                                        <Alert className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700" variant="default">
                                            <AlertCircleIcon />
                                            <AlertTitle>
                                                <div className="flex flex-row gap-3 justify-center items-center">
                                                <span>Deletion requested by {a.deletionRequestedByUsername}
                                                {a.deletionRequestedAt && ` on ${new Date(a.deletionRequestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}</span>
                                                {auth.getUserInfo()?.username === a.deletionRequestedByUsername && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-amber-200 text-amber-900 border-amber-400 hover:bg-amber-300 dark:bg-amber-800/60 dark:text-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/80"
                                                    onClick={() => onCancelDeletionRequest(a.id)}
                                                >
                                                    Cancel request
                                                </Button>
                                                )}
                                                {auth.admin && a.deletionRequestId != null && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-red-100 text-red-800 border-red-300 dark:bg-red-500/50 dark:text-red-50 dark:border-red-400/70 hover:bg-red-200 dark:hover:bg-red-500/70"
                                                        onClick={() => onAcceptDeletionRequest(a)}
                                                    >
                                                        Accept
                                                    </Button>
                                                </>
                                                )}
                                                </div>
                                            </AlertTitle>
                                        </Alert>
                                    )}
                                    <AgencyCard highlighted={highlightedAgencyId === a.id} onRemove={onRemove} onRequestDeletion={onRequestDeletion} agency={a} showRemove={true} deletionRequested={a.deletionRequestedAt != null} />
                                </div>
                            ))}
                            {!searchParams.has("agencyId") && (
                                <Paginator<AgencyModel[]>
                                    pageCount={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    onDataChanged={setAgencies}
                                    onPageChanged={async (pageNum) => {
                                        const res = await agencyApiRef.getAll(pageNum - 1);
                                        if (res.data) {
                                            setTotalPages(res.data.totalPages);
                                            return res.data.agencies;
                                        }
                                        return [];
                                    }}
                                />
                            )}
                        </div> 
                    </div>

            }

        </div>
    )
}