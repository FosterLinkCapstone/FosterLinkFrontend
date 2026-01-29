import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ show, proceed, message }: ConfirmDialogProps<{ message: string }, boolean>) => (
  <Dialog open={show} onOpenChange={(open) => !open && proceed(false)}>
    <DialogContent className="sm:max-w-md bg-background" showCloseButton={false}>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" strokeWidth={2} />
          </div>
          <DialogTitle className="text-left">Confirm Action</DialogTitle>
        </div>
        <DialogDescription className="text-left pt-2">
          {message}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-1">
        <Button
          variant="outline"
          onClick={() => proceed(false)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => proceed(true)}
          className="w-full sm:w-auto bg-red-200 text-red-400"
        >
          Confirm
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const confirm = createConfirmation(confirmable(ConfirmDialog));