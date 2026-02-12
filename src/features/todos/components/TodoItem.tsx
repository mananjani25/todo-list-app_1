import { motion } from 'framer-motion'
import { Check, Trash2, Edit3, Calendar, Flag } from 'lucide-react'
import { cn, formatDate, isOverdue } from '@/lib/utils'
import { PRIORITY_CONFIG } from '@/config/constants'
import type { Todo } from '@/features/todos/types/todo.types'

interface TodoItemProps {
    todo: Todo
    onToggle: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
    onEdit: (todo: Todo) => void
}

export function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
    const priority = PRIORITY_CONFIG[todo.priority]
    const overdue = !todo.is_completed && isOverdue(todo.due_date)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                'group relative glass rounded-xl p-4 transition-all duration-200 hover:border-primary/20',
                todo.is_completed && 'opacity-60'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(todo.id, !todo.is_completed)}
                    className={cn(
                        'mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                        todo.is_completed
                            ? 'bg-primary border-primary'
                            : 'border-border hover:border-primary/50'
                    )}
                >
                    <motion.div
                        initial={false}
                        animate={{ scale: todo.is_completed ? 1 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <Check className="w-3 h-3 text-white" />
                    </motion.div>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                        <h3
                            className={cn(
                                'text-sm font-medium leading-snug transition-all',
                                todo.is_completed && 'line-through text-muted-foreground'
                            )}
                        >
                            {todo.title}
                        </h3>
                        <span
                            className={cn(
                                'flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
                                priority.bg,
                                priority.color,
                                priority.border
                            )}
                        >
                            <Flag className="w-2.5 h-2.5" />
                            {priority.label}
                        </span>
                    </div>

                    {todo.description && (
                        <p className={cn(
                            'text-xs text-muted-foreground mt-1 line-clamp-2',
                            todo.is_completed && 'line-through'
                        )}>
                            {todo.description}
                        </p>
                    )}

                    {todo.due_date && (
                        <div className={cn(
                            'flex items-center gap-1 mt-2 text-xs',
                            overdue ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(todo.due_date)}</span>
                            {overdue && <span className="font-medium">(Overdue)</span>}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(todo)}
                        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        title="Edit"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(todo.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
