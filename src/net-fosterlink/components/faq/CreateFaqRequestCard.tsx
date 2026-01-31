import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircleIcon } from "lucide-react"
import { useState } from "react"
import { BackgroundLoadSpinner } from "../BackgroundLoadSpinner"

export const CreateFaqRequestCard = ({ open, onOpenChange, onSubmit }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmit: (suggestion: string) => Promise<void> }) => {
    const [suggestionText, setSuggestionText] = useState<string>('')
    const [noContentError, setSuggestionNoContentError] = useState<boolean>(false)
    const [submitLoading, setSubmitLoading] = useState<boolean>(false)

    const submit = () => {
        setSubmitLoading(true)
        onSubmit(suggestionText).finally(() => {
            setSuggestionText('')
            setSubmitLoading(false)
        })
    }
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="bg-background w-full mx-2 border-border">
                <DialogHeader>
                    <DialogTitle>Suggest a new FAQ response</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="suggestion">Suggestion</Label>
                        <Input onChange={(e) => {
                            setSuggestionText(e.target.value)
                            if (suggestionText !== '') setSuggestionNoContentError(false)
                        }} id="suggestion" name="suggestion" placeholder="Enter here. Your suggestion will be used as the title to the response." />
                    </div>
                </div>
                {
                    noContentError &&
                    <Alert variant="destructive" className='text-red-600 bg-red-200 mb-6'>
                        <AlertCircleIcon />
                        <AlertTitle>Suggestion cannot be empty!</AlertTitle>
                    </Alert>
                }
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={() => onOpenChange(false)} variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="outline" onClick={() => {
                        if (suggestionText !== '') {
                            submit()
                        } else {
                            setSuggestionNoContentError(true)
                        }
                    }} disabled={submitLoading}>{submitLoading ? <BackgroundLoadSpinner loading={true} className="size-5 shrink-0" /> : "Submit"}</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )

}