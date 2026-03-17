import { useState, useRef, useEffect } from "react"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpandableAlertProps {
    message: string
    className?: string
}

export const ExpandableAlert = ({ message, className }: ExpandableAlertProps) => {
    const [expanded, setExpanded] = useState(false)
    const [overflows, setOverflows] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setExpanded(false)
        const el = textRef.current
        if (el) {
            setOverflows(el.scrollHeight > el.clientHeight + 1)
        }
    }, [message])

    return (
        <Alert
            variant="destructive"
            className={cn(overflows ? "cursor-pointer" : "", className)}
            onClick={() => overflows && setExpanded(prev => !prev)}
        >
            <AlertCircleIcon />
            <AlertTitle
                ref={textRef}
                className={expanded ? "line-clamp-none break-words" : ""}
            >
                {message}
            </AlertTitle>
            {overflows && (
                <p className="col-start-2 text-xs opacity-60 mt-0.5 select-none">
                    {expanded ? "Show less" : "Show more"}
                </p>
            )}
        </Alert>
    )
}
