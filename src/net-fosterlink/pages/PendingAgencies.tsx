import { useSearchParams } from "react-router"
import { useAuth } from "../backend/AuthContext"
import { Navbar } from "../components/Navbar"
import { Link } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PendingAgenciesTab } from "../components/agencies/PendingAgenciesTab"
import { HiddenAgenciesTab } from "../components/agencies/HiddenAgenciesTab"
import { AgencyDeletionRequestsTab } from "../components/agencies/AgencyDeletionRequestsTab"

const TAB_PENDING = "pending"
const TAB_HIDDEN = "hidden"
const TAB_DELETION = "deletion"
const TAB_PARAM = "tab"

type ActiveTab = typeof TAB_PENDING | typeof TAB_HIDDEN | typeof TAB_DELETION

const isValidTab = (t: string | null): t is ActiveTab =>
    t === TAB_PENDING || t === TAB_HIDDEN || t === TAB_DELETION

export const PendingAgencies = () => {
    const auth = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    const tabFromUrl = searchParams.get(TAB_PARAM) ?? TAB_PENDING
    const activeTab: ActiveTab = isValidTab(tabFromUrl) ? tabFromUrl : TAB_PENDING

    const setTabInUrl = (tab: ActiveTab) => {
        const next = new URLSearchParams(searchParams)
        next.set(TAB_PARAM, tab)
        setSearchParams(next, { replace: true })
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-background border-b border-border h-16 flex items-center justify-center text-muted-foreground">
                <Navbar userInfo={auth.getUserInfo()} />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold mb-1 text-center">Agencies (admin)</h1>
                <Link className="text-primary hover:text-primary/90" to="/agencies">Go back</Link>
                <div className="mb-6" />

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setTabInUrl(v as ActiveTab)}
                    className="mb-6"
                >
                    <TabsList className="w-full">
                        <TabsTrigger value={TAB_PENDING} className="flex-1">Pending</TabsTrigger>
                        <TabsTrigger value={TAB_HIDDEN} className="flex-1">Hidden</TabsTrigger>
                        <TabsTrigger value={TAB_DELETION} className="flex-1">Deletion Requests</TabsTrigger>
                    </TabsList>

                    <TabsContent value={TAB_PENDING} className="mt-4">
                        <PendingAgenciesTab />
                    </TabsContent>

                    <TabsContent value={TAB_HIDDEN} className="mt-4">
                        <HiddenAgenciesTab />
                    </TabsContent>

                    <TabsContent value={TAB_DELETION} className="mt-4">
                        <AgencyDeletionRequestsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
