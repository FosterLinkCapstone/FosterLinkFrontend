import { useRef, useState } from "react"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { userApi } from "@/net-fosterlink/backend/api/UserApi"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircleIcon, Eye, EyeOff } from "lucide-react"
import { StatusDialog } from "@/net-fosterlink/components/StatusDialog"

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const getPasswordError = (password: string): string | null => {
    if (password.length < 12) return "Password must be at least 12 characters."
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter."
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter."
    if (!/\d/.test(password)) return "Password must contain at least one number."
    if (!/[@$!%*?&]/.test(password)) return "Password must contain at least one special character (@$!%*?&)."
    return null
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
    const auth = useAuth()

    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const pendingLogout = useRef(false)
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const reset = () => {
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setErrorMsg(null)
        setLoading(false)
        setShowOld(false)
        setShowNew(false)
        setShowConfirm(false)
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) reset()
        onOpenChange(isOpen)
    }

    const newPasswordError = newPassword ? getPasswordError(newPassword) : null
    const sameAsOld = oldPassword && newPassword && oldPassword === newPassword
    const mismatch = confirmPassword && newPassword !== confirmPassword
    const canSubmit = oldPassword && newPassword && confirmPassword && !newPasswordError && !sameAsOld && !mismatch

    const handleConfirm = async () => {
        if (!canSubmit) return
        setLoading(true)
        setErrorMsg(null)

        const res = await userApi(auth).changePassword(oldPassword, newPassword)
        setLoading(false)

        if (!res.isError) {
            handleOpenChange(false)
            pendingLogout.current = true
            setSuccessMsg("Password changed successfully. You will be logged out.")
        } else {
            setErrorMsg(res.error ?? "Failed to change password.")
        }
    }

    return (
        <>
            <StatusDialog
                open={!!successMsg}
                onOpenChange={() => {
                    setSuccessMsg(null)
                    if (pendingLogout.current) {
                        pendingLogout.current = false
                        auth.logout()
                    }
                }}
                title="Password changed"
                subtext={successMsg ?? ""}
                isSuccess={true}
            />

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-sm bg-background" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Create a new password</DialogTitle>
                        <DialogDescription>
                            You will be logged out after changing your password.
                        </DialogDescription>
                    </DialogHeader>

                    {errorMsg && (
                        <div className="flex items-center gap-2 border border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 rounded-md px-3 py-2">
                            <AlertCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-700 dark:text-red-300">{errorMsg}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="old-password">Old password</Label>
                            <div className="relative">
                                <Input
                                    id="old-password"
                                    type={showOld ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="pr-10"
                                    placeholder="Current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOld(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="new-password">New password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pr-10"
                                    placeholder="New password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {newPasswordError && (
                                <p className="text-xs text-red-600 dark:text-red-400">{newPasswordError}</p>
                            )}
                            {!newPasswordError && sameAsOld && (
                                <p className="text-xs text-red-600 dark:text-red-400">New password must be different from your current password.</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirm-password">Confirm new password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pr-10"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {mismatch && (
                                <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match.</p>
                            )}
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
                            onClick={handleConfirm}
                            disabled={!canSubmit || loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? "Confirming..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
