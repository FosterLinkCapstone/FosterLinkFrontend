import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import type { FaqModel } from "@/net-fosterlink/backend/models/FaqModel"
import { getInitials } from "@/net-fosterlink/util/StringUtil"
import { Check, Share2 } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"

export const FaqDialog = ({detailFaq, handleOpenChange, content} : {detailFaq: FaqModel | null, handleOpenChange: () => void, content: string}) => {
    const [shareSuccess, setShareSuccess] = useState(false)

    const navigate = useNavigate()

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
                  <button onClick={() => navigate(`/users/${detailFaq.author.id}`)} className="flex flex-row gap-2 hover:text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400">
                <span>By</span>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={detailFaq.author.profilePictureUrl} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getInitials(detailFaq.author.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{detailFaq.author.username}</span>
              </button>
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
                  <p className="text-sm text-gray-500">
                    Answered on {new Date(detailFaq.createdAt).toLocaleDateString()}
                  </p>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={share}>
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </button>
                    {
                        shareSuccess && <Check className="h-4 w-4"/>
                    }
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
}