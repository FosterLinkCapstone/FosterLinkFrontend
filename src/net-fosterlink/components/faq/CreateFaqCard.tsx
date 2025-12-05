import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { FaqRequestModel } from "@/net-fosterlink/backend/models/FaqRequestModel"

export const CreateFaqCard = ({
    handleSubmitResponse, 
    handleClose,
    requests
} : {
    handleSubmitResponse: (title: string, summary: string, content: string, answeringId: number) => void, 
    handleClose: () => void,
    requests: FaqRequestModel[] | null
}) => {
    const [newFaqTitle, setNewFaqTitle] = useState('')
    const [answeringId, setAnsweringId] = useState(-1)
    const [newFaqSummary, setNewFaqSummary] = useState('')
    const [newFaqContent, setNewFaqContent] = useState('')
    const [open, setOpen] = useState(false)

    if (requests == null) return (
        <Card className="mb-4 p-4 flex flex-col gap-4 overflow-hidden hover:shadow-md bg-white transition-shadow">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div>
        </Card>
    )

    return (
        <Card className="mb-4 p-4 flex flex-col gap-4 overflow-hidden hover:shadow-md bg-white transition-shadow">
            <h3 className="text-xl font-semibold text-center mb-2">Create New FAQ Response</h3>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        {newFaqTitle || "Select a suggested question or type your own..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[800px] p-0 bg-white">
                    <Command>
                        <CommandInput 
                            placeholder="Search or type custom title..." 
                            value={newFaqTitle}
                            onValueChange={setNewFaqTitle}
                        />
                        <CommandEmpty>
                            <div className="p-2 text-sm">
                                Press Enter to use: "{newFaqTitle}"
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {requests.map((request) => (
                                <CommandItem
                                    key={request.id}
                                    value={request.suggestion}
                                    onSelect={(currentValue) => {
                                        setNewFaqTitle(currentValue)
                                        setAnsweringId(request.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            newFaqTitle === request.suggestion ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex-1">
                                        <div>{request.suggestion}</div>
                                        <div className="text-xs text-gray-500">
                                            Suggested by {request.suggestingUsername}
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            
            <Input 
                onChange={(e) => setNewFaqSummary(e.target.value)} 
                type="text" 
                placeholder="FAQ Summary. Typically 2-3 sentences"
            />
            <Textarea 
                onChange={(e) => setNewFaqContent(e.target.value)} 
                placeholder="FAQ Content. Typically an in depth answer to the question."
            />
            <Button 
                onClick={() => {
                    handleSubmitResponse(newFaqTitle, newFaqSummary, newFaqContent, answeringId)
                    setNewFaqTitle('')
                    setNewFaqSummary('')
                    setNewFaqContent('')
                    setAnsweringId(-1)
                }} 
                variant="outline"
            >
                Submit
            </Button>
            <Button onClick={() => handleClose()} variant="outline">Cancel</Button>
        </Card>
    )
}