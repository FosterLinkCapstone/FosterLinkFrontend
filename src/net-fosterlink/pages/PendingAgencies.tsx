import { useEffect, useState } from "react"
import type { AgencyModel } from "../backend/models/AgencyModel"
import { agencyApi } from "../backend/api/AgencyApi"
import { useAuth } from "../backend/AuthContext"
import { Navbar } from "../components/Navbar"
import { AlertCircleIcon, Loader2 } from "lucide-react"
import { AgencyCard } from "../components/agencies/AgencyCard"
import { Button } from "@/components/ui/button"
import { StatusDialog } from "../components/StatusDialog"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Link } from "react-router"

export const PendingAgencies = () => {
    const auth = useAuth()
    const [agencies, setAgencies] = useState<AgencyModel[] | null>(null)
    const [approvedOrDenied, setApprovedOrDenied] = useState('')
    const [isError, setIsError] = useState<boolean>(false)

    const agencyApiRef = agencyApi(auth)
    useEffect(() => {
        agencyApiRef.getPending().then(res => {
            setAgencies(res)
        })
    }, [])

    const onApprove = (id: number, approve: boolean) => {
        agencyApiRef.approve(id, approve).then(res => {
            if (res == true) {
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

    return (
        <div className="min-h-screen bg-gray-50">
                  <StatusDialog open={approvedOrDenied != ''}
                        onOpenChange={() => setApprovedOrDenied('')}
                        title={`Successfully ${approvedOrDenied} FAQ response`}
                        subtext=""
                        isSuccess={true}
                />
                <StatusDialog open={isError}
                        onOpenChange={() => setIsError(false)}
                        title={`Could not update agency!`}
                        subtext="Please try again later"
                        isSuccess={false}
                />
            <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-center text-gray-400">
                <Navbar userInfo={auth.getUserInfo()} />
            </div>
            {
                agencies == null ?
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                    </div>
                    :
                    <div className="w-screen h-full items-center justify-items-center mt-2">
                         <h1 className="text-3xl font-bold mb-2 text-center">Agencies (pending)</h1>
                         <Link className="text-blue-600 hover:text-blue-800" to="/agencies">Go back</Link>
                        <div className="mt-6 w-fit h-full flex flex-col items-center gap-6 pb-3">
                            {agencies.map(a => <div className="flex flex-col w-full gap-1">
                                {
                                    a.approved == 3 &&
                                        <Alert className="bg-red-300 text-red-900" variant="destructive">
                                            <AlertCircleIcon/>
                                            <AlertTitle>Denied by {a.approvedByUsername}</AlertTitle>
                                        </Alert>
                                }
                                <AgencyCard onRemove={() => {return}} agency={a} /> {/* pending card will never call remove */}
                                <div className="w-full flex flex-col mt-1 gap-2">
                                    <Button variant="outline" onClick={() => onApprove(a.id, true)} className="bg-green-200 text-green-800">Approve</Button>
                                    {
                                        a.approved !== 3 && <Button variant="outline" onClick={() => onApprove(a.id, false)} className="bg-red-200 text-red-800">Deny</Button>
                                    }
                                </div>
                            </div>)}
                        </div>
                    </div>
            }

        </div>
    )
}