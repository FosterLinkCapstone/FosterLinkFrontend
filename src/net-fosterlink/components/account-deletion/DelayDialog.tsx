import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock } from "lucide-react"

interface DelayDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    newAutoApproveBy: Date
    onConfirm: (reason: string) => void
    loading?: boolean
    title?: string
}

const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

export const DelayDialog = ({ open, onOpenChange, newAutoApproveBy, onConfirm, loading, title }: DelayDialogProps) => {
    const [reason, setReason] = useState("")

    const handleConfirm = () => {
        if (!reason.trim()) return
        onConfirm(reason.trim())
        setReason("")
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setReason("")
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-background" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <Clock className="h-6 w-6 text-amber-500 flex-shrink-0" strokeWidth={2} />
                        <DialogTitle className="text-left">{title ?? "Why are you delaying the deletion of this account?"}</DialogTitle>
                    </div>
                    <DialogDescription className="text-left">
                        Deletion will take place automatically 30 days from now, on{" "}
                        <span className="font-medium text-foreground">{formatDate(newAutoApproveBy)}</span>
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    placeholder="Enter delay reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1500}
                    rows={4}
                    className="resize-none"
                />

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-1">
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
                        disabled={!reason.trim() || loading}
                        className="w-full sm:w-auto bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/60"
                    >
                        {loading ? "Saving..." : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
