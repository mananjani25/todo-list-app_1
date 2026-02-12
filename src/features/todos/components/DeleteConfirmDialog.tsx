import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    isDeleting: boolean
    todoTitle: string
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    todoTitle,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                        </div>
                        <DialogTitle>Delete Task</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete &ldquo;{todoTitle}&rdquo;?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
