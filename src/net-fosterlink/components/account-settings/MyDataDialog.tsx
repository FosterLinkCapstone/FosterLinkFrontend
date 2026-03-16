import { useState } from "react"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { userApi, type UserDataExport } from "@/net-fosterlink/backend/api/UserApi"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, Download, Loader2 } from "lucide-react"

interface MyDataDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm space-y-1">
                {children}
            </div>
        </div>
    )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex gap-2">
            <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
            <span className="break-all">{value ?? <span className="text-muted-foreground italic">—</span>}</span>
        </div>
    )
}

function Bool({ label, value }: { label: string; value: boolean }) {
    return <Row label={label} value={value ? "Yes" : "No"} />
}

function DataView({ data }: { data: UserDataExport }) {
    return (
        <div className="space-y-4 text-sm">
            <Section title="Profile">
                <Row label="User ID" value={data.id} />
                <Row label="First name" value={data.firstName} />
                <Row label="Last name" value={data.lastName} />
                <Row label="Username" value={data.username} />
                <Row label="Email" value={data.email} />
                <Row label="Phone" value={data.phoneNumber} />
                <Row label="Account created" value={new Date(data.createdAt).toLocaleString()} />
                {data.updatedAt && <Row label="Last updated" value={new Date(data.updatedAt).toLocaleString()} />}
                <Bool label="Email verified" value={data.emailVerified} />
                <Bool label="Verified foster" value={data.verifiedFoster} />
                <Bool label="Verified agency rep" value={data.verifiedAgencyRep} />
                <Bool label="Administrator" value={data.administrator} />
                <Bool label="FAQ author" value={data.faqAuthor} />
                <Bool label="Unsubscribed from all" value={data.unsubscribeAll} />
                {data.bannedAt && <Row label="Banned at" value={new Date(data.bannedAt).toLocaleString()} />}
                {data.restrictedAt && <Row label="Restricted at" value={new Date(data.restrictedAt).toLocaleString()} />}
                {data.restrictedUntil && <Row label="Restricted until" value={new Date(data.restrictedUntil).toLocaleString()} />}
            </Section>

            <Section title={`Threads (${data.threads.length})`}>
                {data.threads.length === 0 ? (
                    <span className="text-muted-foreground italic">No threads</span>
                ) : (
                    data.threads.map(t => (
                        <div key={t.id} className="border-b border-border last:border-0 pb-1 last:pb-0 pt-1 first:pt-0">
                            <div className="font-medium truncate">{t.title || <span className="italic text-muted-foreground">Untitled</span>}</div>
                            <div className="text-xs text-muted-foreground">
                                Posted {new Date(t.createdAt).toLocaleDateString()}
                                {t.hidden && " · hidden"}
                                {t.userDeleted && " · deleted by you"}
                            </div>
                        </div>
                    ))
                )}
            </Section>

            <Section title={`Agencies (${data.agencies.length})`}>
                {data.agencies.length === 0 ? (
                    <span className="text-muted-foreground italic">No agencies</span>
                ) : (
                    data.agencies.map(a => (
                        <div key={a.id} className="border-b border-border last:border-0 pb-1 last:pb-0 pt-1 first:pt-0">
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {a.websiteUrl}
                                {" · "}
                                {a.approved === true ? "Approved" : a.approved === false ? "Denied" : "Pending"}
                            </div>
                        </div>
                    ))
                )}
            </Section>

            <Section title="Email preferences">
                <Row
                    label="Disabled email types"
                    value={data.disabledEmailTypeIds.length > 0
                        ? data.disabledEmailTypeIds.join(", ")
                        : <span className="text-muted-foreground italic">None disabled</span>}
                />
                <Row
                    label="Mailing list IDs"
                    value={data.mailingListIds.length > 0
                        ? data.mailingListIds.join(", ")
                        : <span className="text-muted-foreground italic">None</span>}
                />
            </Section>

            <Section title="Account deletion request">
                {data.accountDeletionRequest ? (
                    <>
                        <Row label="Requested at" value={new Date(data.accountDeletionRequest.requestedAt).toLocaleString()} />
                        <Row label="Auto-approve by" value={new Date(data.accountDeletionRequest.autoApproveBy).toLocaleString()} />
                        <Bool label="Clear account data" value={data.accountDeletionRequest.clearAccount} />
                    </>
                ) : (
                    <span className="text-muted-foreground italic">No pending deletion request</span>
                )}
            </Section>

            <Section title={`Consent records (${data.consentRecords.length})`}>
                {data.consentRecords.length === 0 ? (
                    <span className="text-muted-foreground italic">No records</span>
                ) : (
                    data.consentRecords.map((c, i) => (
                        <div key={i} className="border-b border-border last:border-0 pb-1 last:pb-0 pt-1 first:pt-0">
                            <div className="font-medium">
                                {c.consentType}
                                {" — "}
                                <span className={c.granted ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                    {c.granted ? "Granted" : "Withdrawn"}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(c.timestamp).toLocaleString()}
                                {c.mechanism && ` · ${c.mechanism}`}
                                {c.policyVersion && ` · v${c.policyVersion}`}
                            </div>
                        </div>
                    ))
                )}
            </Section>
        </div>
    )
}

export const MyDataDialog = ({ open, onOpenChange }: MyDataDialogProps) => {
    const auth = useAuth()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<UserDataExport | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [downloadLoading, setDownloadLoading] = useState(false)
    const [downloadError, setDownloadError] = useState<string | null>(null)

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setData(null)
            setError(null)
            setDownloadError(null)
        }
        onOpenChange(isOpen)
    }

    const load = async () => {
        setLoading(true)
        setError(null)
        const res = await userApi(auth).getMyData()
        setLoading(false)
        if (res.isError) {
            setError(res.error ?? "Failed to load data.")
        } else {
            setData(res.data ?? null)
        }
    }

    const handleDownload = async () => {
        setDownloadLoading(true)
        setDownloadError(null)
        const res = await userApi(auth).exportData()
        setDownloadLoading(false)
        if (res.isError) {
            setDownloadError(res.error ?? "Download failed.")
        } else if (res.data) {
            const url = URL.createObjectURL(res.data)
            const a = document.createElement("a")
            a.href = url
            a.download = "fosterlink-data-export.json"
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    // Trigger data load when dialog opens
    const handleDialogOpenChange = (isOpen: boolean) => {
        if (isOpen && !data && !loading) {
            void load()
        }
        handleOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="sm:max-w-xl bg-background max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Your Personal Data</DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                    {loading && (
                        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading your data…</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-destructive py-4">
                            <AlertCircleIcon className="h-5 w-5 shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {data && <DataView data={data} />}

                    {downloadError && (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                            <AlertCircleIcon className="h-4 w-4 shrink-0" />
                            <span>{downloadError}</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border mt-2">
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto gap-2"
                        onClick={handleDownload}
                        disabled={downloadLoading || loading}
                        type="button"
                    >
                        {downloadLoading
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Download className="h-4 w-4" />}
                        {downloadLoading ? "Preparing…" : "Download JSON"}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => handleOpenChange(false)}
                        type="button"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
