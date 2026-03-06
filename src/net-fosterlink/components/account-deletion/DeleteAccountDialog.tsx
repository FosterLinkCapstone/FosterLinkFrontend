import { useState } from "react"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { accountDeletionApi } from "@/net-fosterlink/backend/api/AccountDeletionApi"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"
import { AlertCircleIcon, Info } from "lucide-react"

interface DeleteAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Called after a deletion request is successfully submitted */
    onSuccess?: () => void
}

const CONTACT_EMAIL = "placeholder@fosterlink.net"

const InfoDialog = ({
    open,
    onOpenChange,
    children,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm bg-background" showCloseButton={false}>
            <DialogDescription className="text-sm text-foreground leading-relaxed">
                {children}
            </DialogDescription>
            <DialogFooter>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                >
                    Ok
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)

export const DeleteAccountDialog = ({ open, onOpenChange, onSuccess }: DeleteAccountDialogProps) => {
    const auth = useAuth()
    const userInfo = auth.getUserInfo()

    const [clearAccount, setClearAccount] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [loading, setLoading] = useState(false)

    const [showProcessInfo, setShowProcessInfo] = useState(false)
    const [showClearInfo, setShowClearInfo] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const reset = () => {
        setClearAccount(false)
        setAgreed(false)
        setLoading(false)
        setErrorMsg(null)
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) reset()
        onOpenChange(isOpen)
    }

    const handleConfirm = async () => {
        if (!agreed) return
        setLoading(true)
        const res = await accountDeletionApi(auth).requestDeletion(clearAccount)
        setLoading(false)
        if (!res.isError) {
            handleOpenChange(false)
            setSuccessMsg("Your deletion request has been submitted. Your account is now pending deletion.")
            onSuccess?.()
        } else {
            setErrorMsg(res.error ?? "Failed to submit deletion request.")
        }
    }

    return (
        <>
            <InfoDialog open={showProcessInfo} onOpenChange={setShowProcessInfo}>
                <span className="block mb-3">
                    Once deletion is requested for an account, it is sent for approval. After either
                    30 days or manual approval, the account is fully anonymized and data is cleared if
                    its deletion is requested. During the 30 day period, the account's profile can only
                    be accessed by site admins and the owner of the account. During the 30 day period, 
                    the user also has the ability to cancel their account deletion request. Site administrators have
                    the authority to delay deletion by 30 days, although they are required to justify
                    their reasoning. An irreversible hash of the account's email is retained for security purposes, 
                    but it is not linked to any identifiable information and cannot be used to recover the account.
                </span>
                <span className="block text-muted-foreground">
                    Account deletion can be expedited by emailing{" "}
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="underline text-foreground hover:text-primary"
                    >
                        {CONTACT_EMAIL}
                    </a>
                </span>
            </InfoDialog>

            <InfoDialog open={showClearInfo} onOpenChange={setShowClearInfo}>
                Checking this box will delete all data associated with this account. This includes
                threads, replies, likes, FAQs, agencies, and various requests. This data will not
                be recoverable.
            </InfoDialog>

            <StatusDialog
                open={!!successMsg}
                onOpenChange={() => setSuccessMsg(null)}
                title="Deletion request submitted"
                subtext={successMsg ?? ""}
                isSuccess={true}
            />

            <StatusDialog
                open={!!errorMsg}
                onOpenChange={() => setErrorMsg(null)}
                title="Could not submit deletion request"
                subtext={errorMsg ?? ""}
                isSuccess={false}
            />

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md bg-background" showCloseButton={false}>
                    <DialogHeader>
                        {/* Red warning header */}
                        <div className="flex items-center gap-2 border border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 rounded-md px-3 py-2 mb-3">
                            <AlertCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                                Please read fully before continuing!
                            </span>
                        </div>
                        <DialogTitle className="text-base text-center">
                            Are you sure you want to delete this account?
                        </DialogTitle>
                    </DialogHeader>

                    {userInfo && (
                        <div className="flex justify-center">
                            <Badge variant="secondary" className="bg-muted text-muted-foreground px-3 py-1 text-sm">
                                {userInfo.fullName}&nbsp;·&nbsp;@{userInfo.username}
                            </Badge>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Process info button */}
                        <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => setShowProcessInfo(true)}
                            type="button"
                        >
                            Account deletion process info
                        </Button>

                        {/* Clear data checkbox */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="clear-account"
                                checked={clearAccount}
                                onChange={(e) => setClearAccount(e.target.checked)}
                                className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                            />
                            <div className="flex items-start gap-1.5 flex-1">
                                <label
                                    htmlFor="clear-account"
                                    className="text-sm leading-snug cursor-pointer"
                                >
                                    Clear all data associated with this account
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowClearInfo(true)}
                                    className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                                    aria-label="More info about data clearing"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Terms agreement checkbox */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="agreed"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                            />
                            <label
                                htmlFor="agreed"
                                className="text-sm leading-snug cursor-pointer"
                            >
                                I have read and fully understand the terms associated with deleting
                                this account
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-1 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleConfirm}
                            disabled={!agreed}
                            className="w-full sm:w-auto bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-40"
                        >
                            {loading ? "Submitting..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
