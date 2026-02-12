import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Flag, Sparkles } from 'lucide-react'
import { createTodoSchema, type CreateTodoFormData } from '@/features/todos/schemas/todo.schema'
import { enhanceTask } from '@/features/ai/services/ai.service'
import type { Todo } from '@/features/todos/types/todo.types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface TodoFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateTodoFormData) => void
    isSubmitting: boolean
    editTodo?: Todo | null
}

export function TodoForm({ isOpen, onClose, onSubmit, isSubmitting, editTodo }: TodoFormProps) {
    const [isEnhancing, setIsEnhancing] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateTodoFormData>({
        resolver: zodResolver(createTodoSchema),
        defaultValues: {
            title: '',
            description: '',
            priority: 'medium',
            due_date: '',
        },
    })

    // Reset form values when editTodo changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            if (editTodo) {
                reset({
                    title: editTodo.title,
                    description: editTodo.description || '',
                    priority: editTodo.priority,
                    due_date: editTodo.due_date ? editTodo.due_date.split('T')[0] : '',
                })
            } else {
                reset({
                    title: '',
                    description: '',
                    priority: 'medium',
                    due_date: '',
                })
            }
        }
    }, [isOpen, editTodo, reset])

    const selectedPriority = watch('priority')
    const titleValue = watch('title')

    const handleAiEnhance = async () => {
        if (!titleValue?.trim() || isEnhancing) return

        setIsEnhancing(true)
        try {
            const enhanced = await enhanceTask(titleValue)
            setValue('title', enhanced.title)
            setValue('description', enhanced.description)
            setValue('priority', enhanced.priority)
            if (enhanced.due_date) {
                setValue('due_date', enhanced.due_date)
            }
            toast.success('Task enhanced by AI!', { description: 'Review the suggested changes' })
        } catch (error) {
            console.error('AI enhance error:', error)
            toast.error('AI enhancement failed. Try again.')
        } finally {
            setIsEnhancing(false)
        }
    }

    const handleFormSubmit = (data: CreateTodoFormData) => {
        onSubmit(data)
        reset()
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="gradient-text">
                        {editTodo ? 'Edit Task' : 'Create New Task'}
                    </DialogTitle>
                    <DialogDescription>
                        {editTodo ? 'Update the details of your task' : 'Fill in the details to create a new task'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Title + AI Enhance */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAiEnhance}
                                disabled={!titleValue?.trim() || isEnhancing}
                                className={cn(
                                    'h-7 text-[11px] gap-1.5',
                                    titleValue?.trim()
                                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                        : 'opacity-50'
                                )}
                            >
                                {isEnhancing ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3 h-3" />
                                )}
                                {isEnhancing ? 'Enhancing...' : '✨ AI Enhance'}
                            </Button>
                        </div>
                        <Input
                            {...register('title')}
                            id="title"
                            placeholder="What needs to be done?"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="mb-1.5 block">Description</Label>
                        <Textarea
                            {...register('description')}
                            id="description"
                            placeholder="Add some details..."
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Priority & Due Date Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="mb-1.5 block">Priority</Label>
                            <div className="flex gap-1.5">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <label
                                        key={p}
                                        className={cn(
                                            'flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all',
                                            selectedPriority === p
                                                ? p === 'low'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                    : p === 'medium'
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                                : 'bg-secondary/30 border-border text-muted-foreground hover:border-border/80'
                                        )}
                                    >
                                        <input
                                            {...register('priority')}
                                            type="radio"
                                            value={p}
                                            className="sr-only"
                                        />
                                        <Flag className="w-3 h-3" />
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="due_date" className="mb-1.5 block">Due Date</Label>
                            <Input
                                {...register('due_date')}
                                id="due_date"
                                type="date"
                                className="[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : editTodo ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create Task
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
