import { useState } from "react"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProfilePictureDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUrl: string
    onConfirm: (url: string) => void
}

export const ProfilePictureDialog = ({ open, onOpenChange, currentUrl, onConfirm }: ProfilePictureDialogProps) => {
    const auth = useAuth()
    const [url, setUrl] = useState(currentUrl)

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) setUrl(currentUrl)
        onOpenChange(isOpen)
    }

    const handleConfirm = () => {
        onConfirm(url.trim())
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm bg-background">
                <DialogHeader>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                    <DialogDescription>
                        Profile picture must be an image URL (e.g. https://example.com/photo.jpg).
                    </DialogDescription>
                </DialogHeader>
                <Input
                    placeholder="URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1"
                />
                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-1 pt-2">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!url.trim() || auth.restricted}
                        className="w-full sm:w-auto"
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
