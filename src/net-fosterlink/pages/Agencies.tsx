import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Paginator } from "../components/Paginator"
import type { AgencyModel } from "../backend/models/AgencyModel"
import { agencyApi, type AgencySearchBy } from "../backend/api/AgencyApi"
import { useAuth } from "../backend/AuthContext"
import { PageLayout } from "../components/PageLayout"
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
import { BackgroundLoadSpinner } from "../components/BackgroundLoadSpinner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sortByCreatedAt, type CreatedAtOrderBy } from "@/net-fosterlink/util/SortUtil"
import { OrderByCreatedAtSelect } from "@/net-fosterlink/components/OrderByCreatedAtSelect"

const getAgencyDate = (a: AgencyModel) => a.createdAt ?? a.updatedAt ?? null

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
    const [hideLoading, setHideLoading] = useState<boolean>(false)
    const [searchInput, setSearchInput] = useState("")
    const [searchBy, setSearchBy] = useState<AgencySearchBy>("agency")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [appliedSearchBy, setAppliedSearchBy] = useState<AgencySearchBy | undefined>(undefined)
    const [orderBy, setOrderBy] = useState<CreatedAtOrderBy>("newest")
    const navigate = useNavigate()

    const highlightedAgencyId = useMemo(() => {
        if (!searchParams.has("agencyId")) return null
        const id = Number(searchParams.get("agencyId"))
        return Number.isNaN(id) ? null : id
    }, [searchParams])

    const agencyApiRefRef = useRef(agencyApi(auth))
    useEffect(() => { agencyApiRefRef.current = agencyApi(auth) }, [auth])

    const fetchAgencies = useCallback((pageNumber: number, searchTerm: string, searchByCategory: AgencySearchBy | undefined) => {
        const params = searchTerm.trim()
            ? { search: searchTerm.trim(), searchBy: searchByCategory ?? "agency" }
            : undefined
        return agencyApiRefRef.current.getAll(pageNumber, params)
    }, [])

    useEffect(() => {
        setCurrentPage(1)
        if (auth.admin) {
            Promise.all([
                fetchAgencies(0, appliedSearch, appliedSearchBy ?? "agency"),
                agencyApiRefRef.current.countPending(),
            ]).then(([agencyRes, pendingRes]) => {
                if (!agencyRes.isError && agencyRes.data) {
                    setAgencies(agencyRes.data.items)
                    setTotalPages(agencyRes.data.totalPages)
                    setCurrentPage(1)
                }
                if (!pendingRes.isError && pendingRes.data !== undefined) {
                    setPendingCount(pendingRes.data)
                }
            })
            if (searchParams.has("creating")) {
                setCreatingAgency(searchParams.get("creating") === "true")
            }
        } else {
            fetchAgencies(0, appliedSearch, appliedSearchBy ?? "agency").then(res => {
                if (!res.isError && res.data) {
                    setAgencies(res.data.items)
                    setTotalPages(res.data.totalPages)
                    setCurrentPage(1)
                }
            })
        }
    }, [appliedSearch, appliedSearchBy, fetchAgencies, auth.admin])

    const handleSearchClick = () => {
        setAppliedSearch(searchInput.trim())
        setAppliedSearchBy(searchBy)
        setCurrentPage(1)
    }

    const displayedAgencies = useMemo(
        () => (agencies == null ? null : sortByCreatedAt(agencies, orderBy, getAgencyDate)),
        [agencies, orderBy]
    )
    useEffect(() => {
        if (auth.agent && searchParams.has("creating")) {
            setCreatingAgency(searchParams.get("creating") === "true")
        }
    }, [auth.agent])

    const handleCreateAgency = useCallback(async (agency: CreateAgencyModel) => {
        agencyApiRefRef.current.create(agency).then(res => {
            if (res.isError) {
                setCreateError(res)
            } else {
                setCreatingAgency(false)
                setActionResult({ success: true, title: "Successfully created agency!", subtext: "Awaiting review from an administrator." })
            }
        })
    }, [])

    const onRemove = useCallback(async (agencyId: number) => {
        const confirmed = await confirm({
            message: "Remove this agency from the public list? It will be moved to the hidden list and can be restored or permanently deleted later.",
        })
        if (!confirmed) return
        setHideLoading(true)
        agencyApiRefRef.current.hideAgency(agencyId, true).then(res => {
            if (!res.isError) {
                setAgencies(prev => prev?.filter(a => a.id !== agencyId) ?? [])
                setActionResult({ success: true, title: "Successfully removed agency!", subtext: "" })
            } else {
                setActionResult({ success: false, title: "Could not remove agency!", subtext: res.error ?? "" })
            }
        }).finally(() => setHideLoading(false))
    }, [])

    const onDelete = useCallback(async (agencyId: number) => {
        const confirmed = await confirm({
            message: "Are you sure you want to delete this agency? It will be sent for review, and will auto-delete after 30 days if not approved. Contact admin@fosterlink.net for expedited approval.",
        })
        if (!confirmed) return
        agencyApiRefRef.current.requestDeletion(agencyId).then(res => {
            if (!res.isError) {
                const user = auth.getUserInfo()
                setAgencies(prev => prev?.map(a => a.id === agencyId && user
                    ? { ...a, deletionRequestedAt: new Date().toISOString(), deletionRequestedByUsername: user.username }
                    : a) ?? null)
                setActionResult({ success: true, title: "Deletion request submitted", subtext: "It will appear in the deletion requests list for review." })
            } else {
                setActionResult({ success: false, title: "Could not submit deletion request", subtext: res.error ?? "" })
            }
        })
    }, [auth])

    const onRequestDeletion = useCallback((agencyId: number) => {
        agencyApiRefRef.current.requestDeletion(agencyId).then(res => {
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
    }, [auth])

    const onSentToPending = useCallback((agencyId: number) => {
        setAgencies(prev => prev?.filter(a => a.id !== agencyId) ?? [])
        setPendingCount(prev => prev + 1)
        setActionResult({ success: true, title: "Changes saved", subtext: "This agency has been sent back to pending approval and is no longer on the public list. An administrator will need to approve it again." })
    }, [])

    const onCancelDeletionRequest = (agencyId: number) => {
        agencyApiRefRef.current.cancelDeletionRequest(agencyId).then(res => {
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
        const res = await agencyApiRefRef.current.approveDeletionRequest(agency.deletionRequestId)
        if (!res.isError) {
            setAgencies(prev => prev?.filter(a => a.id !== agency.id) ?? [])
            setActionResult({ success: true, title: "Deletion request accepted — agency deleted", subtext: "" })
        } else {
            setActionResult({ success: false, title: "Could not accept deletion request", subtext: res.error ?? "" })
        }
    }


    return (
        <PageLayout auth={auth}>
            <BackgroundLoadSpinner loading={hideLoading} />
            <title>Agencies</title>
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
            {
                agencies == null ?
                    <div className="min-h-screen bg-background flex items-center justify-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                    :
                    <div className="w-full max-w-7xl mx-auto px-4 py-4 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold my-2 text-center">Agencies</h1>
                        <div className="h-full flex flex-col items-center gap-2 pb-3 min-w-0">
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
                                <Button onClick={() => { setCreatingAgency(!creatingAgency) }} variant="outline" className="w-full my-4" disabled={auth.restricted}>Create a new agency</Button>
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
                            <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full max-w-full min-w-0 mb-4">
                                <Select value={searchBy} onValueChange={(v) => setSearchBy(v as AgencySearchBy)}>
                                    <SelectTrigger className="w-full sm:w-[200px] shrink-0">
                                        <SelectValue placeholder="Search in">
                                            {searchBy === "agency" && "Agency"}
                                            {searchBy === "agent" && "Agent"}
                                            {searchBy === "location" && "Location"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agency">
                                            <span className="flex flex-col items-start gap-0.5">
                                                <span>Agency</span>
                                                <span className="text-xs font-normal text-muted-foreground">Name, mission statement</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="agent">
                                            <span className="flex flex-col items-start gap-0.5">
                                                <span>Agent</span>
                                                <span className="text-xs font-normal text-muted-foreground">Full name, username, email, phone</span>
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="location">
                                            <span className="flex flex-col items-start gap-0.5">
                                                <span>Location</span>
                                                <span className="text-xs font-normal text-muted-foreground">City, state, zip code</span>
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <OrderByCreatedAtSelect value={orderBy} onValueChange={setOrderBy} className="shrink-0" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                                    className="flex-1 min-w-0"
                                />
                                <Button type="button" variant="secondary" onClick={handleSearchClick} className="shrink-0">Search</Button>
                            </div>
                            {(displayedAgencies?.length ?? 0) === 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : (displayedAgencies ?? []).filter(a => searchParams.has("agencyId") ? a.id === parseInt(searchParams.get("agencyId")!) : true).map(a => (
                                <div key={a.id} className="flex flex-col w-full gap-1">
                                    {a.deletionRequestedAt && (
                                        <Alert className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700" variant="default">
                                            <AlertCircleIcon />
                                            <AlertTitle>
                                                <div className="flex flex-row gap-3 justify-center items-center">
                                                <span>
                                                    {a.deletionRequestedByUsername
                                                        ? `Deletion requested by ${a.deletionRequestedByUsername}`
                                                        : "Deletion requested"}
                                                    {` on ${new Date(a.deletionRequestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                </span>
                                                {(auth.getUserInfo()?.username === a.deletionRequestedByUsername || auth.getUserInfo()?.id === a.agent.id) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-amber-200 text-amber-900 border-amber-400 hover:bg-amber-300 dark:bg-amber-800/60 dark:text-amber-100 dark:border-amber-600 dark:hover:bg-amber-800/80"
                                                    onClick={() => onCancelDeletionRequest(a.id)}
                                                    disabled={auth.restricted}
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
                                                        disabled={auth.restricted}
                                                    >
                                                        Accept
                                                    </Button>
                                                </>
                                                )}
                                                </div>
                                            </AlertTitle>
                                        </Alert>
                                    )}
                                    <AgencyCard highlighted={highlightedAgencyId === a.id} onRemove={onRemove} onDelete={auth.admin ? onDelete : undefined} onRequestDeletion={onRequestDeletion} onSentToPending={onSentToPending} agency={a} showRemove={true} deletionRequested={a.deletionRequestedAt != null} />
                                </div>
                            ))}
                            {!searchParams.has("agencyId") && (
                                <Paginator<AgencyModel[]>
                                    pageCount={totalPages}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    onDataChanged={setAgencies}
                                    onPageChanged={async (pageNum) => {
                                        const res = await fetchAgencies(pageNum - 1, appliedSearch, appliedSearchBy ?? "agency");
                                        if (res.data) {
                                            setTotalPages(res.data.totalPages);
                                            return res.data.items;
                                        }
                                        return [];
                                    }}
                                />
                            )}
                        </div> 
                    </div>

            }

        </PageLayout>
    )
}