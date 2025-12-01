import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import type { PendingFaqModel } from "@/net-fosterlink/backend/models/PendingFaqModel"
import { getInitials } from "@/net-fosterlink/util/StringUtil"
import { Check, Share2 } from "lucide-react"
import { useState } from "react"

export const PendingFaqDialog = ({ detailFaq, handleOpenChange, content, onApprove, onDeny }: { detailFaq: PendingFaqModel | null, handleOpenChange: () => void, content: string, onApprove: (faq: PendingFaqModel) => void, onDeny: (faq: PendingFaqModel) => void }) => {
    const [shareSuccess, setShareSuccess] = useState(false)

    const share = () => {
        const url = `${window.location.origin}/faq?openId=${detailFaq?.id}`
        navigator.clipboard.writeText(url).then(() => {
            setShareSuccess(true)
            setTimeout(() => {
                setShareSuccess(false)
            }, 3000)
        })

    }

    return (
        <Dialog open={!!detailFaq} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white rounded-3xl">
                {detailFaq && (
                    <div className="flex flex-col h-full">
                        <DialogHeader className="p-6 pb-4 border-b">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-3">{detailFaq.title}</h2>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={detailFaq.author.profilePictureUrl} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                            {getInitials(detailFaq.author.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{detailFaq.author.username}</span>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {content}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t bg-white rounded-b-3xl">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    className="text-sm text-green-600 hover:text-green-800 font-medium" onClick={() => onApprove(detailFaq)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="text-sm text-red-600 hover:text-red-800 font-medium" onClick={() => onDeny(detailFaq)}
                                >
                                    Deny
                                </button>
                                <p className="text-sm text-gray-500">
                                    Answered on {new Date(detailFaq.createdAt).toLocaleDateString()}
                                </p>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={share}>
                                    <Share2 className="h-4 w-4 text-gray-600" />
                                </button>
                                {
                                    shareSuccess && <Check className="h-4 w-4" />
                                }
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog >
    )
}