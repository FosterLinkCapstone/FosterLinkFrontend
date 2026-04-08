import { useEffect, useState } from "react"
import { useAuth } from "@/net-fosterlink/backend/AuthContext"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/net-fosterlink/util/StringUtil"

interface ProfilePictureDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUrl: string
    onConfirm: (url: string) => void
    fullName: string
    username: string
}

const DEFAULT_PFP_URL = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106"

export const ProfilePictureDialog = ({ open, onOpenChange, currentUrl, onConfirm, fullName, username }: ProfilePictureDialogProps) => {
    const auth = useAuth()
    const isDefault = currentUrl === DEFAULT_PFP_URL
    const displayUrl = isDefault ? "" : currentUrl
    const [url, setUrl] = useState(displayUrl)
    const [previewUrl, setPreviewUrl] = useState(displayUrl)

    useEffect(() => {
        const trimmed = url.trim()
        const timer = setTimeout(() => setPreviewUrl(trimmed), 300)
        return () => clearTimeout(timer)
    }, [url])

    useEffect(() => {
        if (open) {
            setUrl(displayUrl)
            setPreviewUrl(displayUrl)
        }
    }, [open])

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setUrl(displayUrl)
            setPreviewUrl(displayUrl)
        }
        onOpenChange(isOpen)
    }

    const handleConfirm = () => {
        onConfirm(url.trim())
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg bg-background">
                <DialogHeader>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Image URL (e.g. https://example.com/photo.jpg)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        For best results, use a square image. Non-square images will appear stretched.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Raw image preview */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground text-center">Image</p>
                            <div className="rounded-md border overflow-hidden bg-muted flex items-center justify-center aspect-square w-full">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full"
                                        style={{ objectFit: "fill" }}
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">No image</span>
                                )}
                            </div>
                        </div>
                        {/* Profile card preview */}
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground text-center">Profile</p>
                            <div className="flex flex-col items-center gap-1 p-3 rounded-md border bg-muted/30 aspect-square w-full justify-center">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={previewUrl} alt={fullName} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-base">
                                        {getInitials(fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-xs font-semibold mt-0.5 truncate max-w-full">{fullName || "—"}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-full">@{username}</p>
                            </div>
                        </div>
                    </div>
                </div>
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
