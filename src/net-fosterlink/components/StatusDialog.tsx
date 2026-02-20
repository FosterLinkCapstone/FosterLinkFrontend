import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

export const StatusDialog = ({ title, subtext, open, onOpenChange, isSuccess } : {open: boolean, onOpenChange: (open: boolean) => void, title: string, subtext: string, isSuccess: boolean}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl [&>button]:hidden bg-background dark:border-border">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {
                isSuccess ? <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" strokeWidth={2} />
                          : <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" strokeWidth={2}/>
              }
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-1 text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtext}</p>
            </div>
          </div>
          <Button 
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="px-8 dark:bg-muted dark:border-border dark:hover:bg-muted/80"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};