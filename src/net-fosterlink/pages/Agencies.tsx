import { useEffect, useMemo, useState } from "react"
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

export const Agencies = () => {
    const auth = useAuth()
    const [searchParams, _] = useSearchParams()
    const [agencies, setAgencies] = useState<AgencyModel[] | null>(null)
    const [pendingCount, setPendingCount] = useState(0)
    const [creatingAgency, setCreatingAgency] = useState<boolean>(false)
    const [createError, setCreateError] = useState<ErrorWrapper<AgencyModel> | null>(null)
    const [createSuccess, setCreateSuccess] = useState<boolean>(false)
    const [removeSuccess, setRemoveSuccess] = useState<boolean>(false)
    const [removeError, setRemoveError] = useState<boolean>(false)
    const navigate = useNavigate()

    const highlightedAgencyId = useMemo(() => {
        if (!searchParams.has("agencyId")) return null
        const id = Number(searchParams.get("agencyId"))
        return Number.isNaN(id) ? null : id
    }, [searchParams])

    const agencyApiRef = useMemo(() => agencyApi(auth), [auth])
    useEffect(() => {
        agencyApiRef.getAll().then(res => {
            if (!res.isError && res.data) {
                setAgencies(res.data)
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
                setCreateSuccess(true)
            }
        })
    }
    const onRemove = (agencyId: number) => {
        agencyApiRef.approve(agencyId, false).then(res => {
            if (!res.isError && res.data) {
                setAgencies(agencies?.filter(a => a.id !== agencyId) ?? [])
                setRemoveSuccess(true)
            } else {
                setRemoveError(true)
            }
        })
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
            { createSuccess &&
            <StatusDialog open={createSuccess}
                onOpenChange={() => setCreateSuccess(false)}
                title={`Successfully created agency!`}
                subtext="Awaiting review from an administrator."
                isSuccess={true}
            />      
            }
            { removeSuccess &&    
            <StatusDialog open={removeSuccess}
                onOpenChange={() => setRemoveSuccess(false)}
                title={`Successfully removed agency!`}
                subtext=""
                isSuccess={true}
            />
            }
            { removeError &&
            <StatusDialog open={removeSuccess}
                onOpenChange={() => setRemoveError(false)}
                title={`Could not remove agency!`}
                subtext=""
                isSuccess={false}
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
                        <div className="w-fit h-full flex flex-col items-center gap-2 pb-3">
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
                            {agencies.length == 0 ? <h2 className="text-2xl font-bold my-2 text-center">No content!</h2> : agencies.filter(a => searchParams.has("agencyId") ? a.id === parseInt(searchParams.get("agencyId")!) : true).map(a => <AgencyCard key={a.id} highlighted={highlightedAgencyId === a.id} onRemove={onRemove} agency={a} />)}
                        </div> 
                    </div>

            }

        </div>
    )
}