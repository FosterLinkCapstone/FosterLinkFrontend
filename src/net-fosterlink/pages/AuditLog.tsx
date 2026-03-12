import { useEffect, useRef, useState } from "react"
import { PageLayout } from "../components/PageLayout"
import { useAuth } from "../backend/AuthContext"
import { userApi } from "../backend/api/UserApi"
import type { AuditLogEntryModel } from "../backend/models/AuditLogModel"
import { Card } from "@/components/ui/card"
import { Paginator } from "../components/Paginator"

const formatDateTime = (date: Date | string) => {
    const d = new Date(date)
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

const AuditLogEntryCard = ({ entry }: { entry: AuditLogEntryModel }) => (
    <Card className="px-4 py-3 w-full hover:shadow-md transition-shadow flex flex-col justify-center min-h-[80px]">
        <p className="text-base leading-snug text-center flex-1 flex items-center justify-center">{entry.displayMessage}</p>
        <p className="text-xs text-muted-foreground text-right mt-2">
            Recorded {formatDateTime(entry.createdAt)}
        </p>
    </Card>
)

export const AuditLog = () => {
    const auth = useAuth()
    const apiRef = useRef(userApi(auth))
    apiRef.current = userApi(auth)

    const [entries, setEntries] = useState<AuditLogEntryModel[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        apiRef.current.getAuditLog(0).then(res => {
            if (!res.isError && res.data) {
                setEntries(res.data.items)
                setTotalPages(res.data.totalPages)
                setCurrentPage(1)
                setError(null)
            } else {
                setError(res.error ?? "Failed to load audit log")
            }
        }).finally(() => setLoading(false))
    }, [])

    return (
        <PageLayout auth={auth}>
            <title>Audit Log</title>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center mb-6">Audit Log</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-8 rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive py-12">{error}</div>
                ) : entries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">No audit log entries found.</p>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        {entries.map(entry => (
                            <AuditLogEntryCard key={entry.id} entry={entry} />
                        ))}
                        <Paginator<AuditLogEntryModel[]>
                            pageCount={totalPages}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            onDataChanged={setEntries}
                            onPageChanged={async (pageNum) => {
                                const res = await apiRef.current.getAuditLog(pageNum - 1)
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
