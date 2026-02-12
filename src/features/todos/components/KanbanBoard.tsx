import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Edit3, Trash2, Flag, Calendar, Plus } from 'lucide-react'
import { cn, formatDate, isOverdue } from '@/lib/utils'
import { PRIORITY_CONFIG } from '@/config/constants'
import type { Todo } from '@/features/todos/types/todo.types'

type TodoStatus = 'todo' | 'in_progress' | 'completed'

interface KanbanBoardProps {
    todos: Todo[]
    onStatusChange: (id: string, status: TodoStatus) => void
    onEdit: (todo: Todo) => void
    onDelete: (id: string) => void
    onAddTodo: () => void
}

const COLUMNS: { id: TodoStatus; title: string; color: string; dotColor: string }[] = [
    { id: 'todo', title: 'To Do', color: 'text-info', dotColor: 'bg-info' },
    { id: 'in_progress', title: 'In Progress', color: 'text-warning', dotColor: 'bg-warning' },
    { id: 'completed', title: 'Completed', color: 'text-success', dotColor: 'bg-success' },
]

export function KanbanBoard({ todos, onStatusChange, onEdit, onDelete, onAddTodo }: KanbanBoardProps) {
    const [dragOverColumn, setDragOverColumn] = useState<TodoStatus | null>(null)
    const [draggingId, setDraggingId] = useState<string | null>(null)

    const getColumnTodos = useCallback(
        (status: TodoStatus) => todos.filter((t) => (t.status || (t.is_completed ? 'completed' : 'todo')) === status),
        [todos]
    )

    const handleDragStart = useCallback((e: React.DragEvent, todoId: string) => {
        e.dataTransfer.setData('text/plain', todoId)
        e.dataTransfer.effectAllowed = 'move'
        setDraggingId(todoId)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, columnId: TodoStatus) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverColumn(columnId)
    }, [])

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent, targetStatus: TodoStatus) => {
            e.preventDefault()
            const todoId = e.dataTransfer.getData('text/plain')
            if (todoId) {
                onStatusChange(todoId, targetStatus)
            }
            setDragOverColumn(null)
            setDraggingId(null)
        },
        [onStatusChange]
    )

    const handleDragEnd = useCallback(() => {
        setDragOverColumn(null)
        setDraggingId(null)
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((column) => {
                const columnTodos = getColumnTodos(column.id)
                const isOver = dragOverColumn === column.id

                return (
                    <motion.div
                        key={column.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            'glass rounded-2xl p-4 transition-all duration-200 min-h-[300px]',
                            isOver && 'ring-2 ring-primary/40 bg-primary/5'
                        )}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={cn('w-2.5 h-2.5 rounded-full', column.dotColor)} />
                                <h3 className={cn('text-sm font-semibold', column.color)}>
                                    {column.title}
                                </h3>
                                <span className="text-[11px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-md font-medium">
                                    {columnTodos.length}
                                </span>
                            </div>
                            {column.id === 'todo' && (
                                <button
                                    onClick={onAddTodo}
                                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Cards */}
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {columnTodos.map((todo) => (
                                    <KanbanCard
                                        key={todo.id}
                                        todo={todo}
                                        isDragging={draggingId === todo.id}
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                ))}
                            </AnimatePresence>

                            {columnTodos.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={cn(
                                        'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
                                        isOver
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-border/30'
                                    )}
                                >
                                    <p className="text-xs text-muted-foreground/60">
                                        {isOver ? 'Drop here' : 'No tasks'}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// --- Kanban Card ---

interface KanbanCardProps {
    todo: Todo
    isDragging: boolean
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
    onEdit: (todo: Todo) => void
    onDelete: (id: string) => void
}

function KanbanCard({ todo, isDragging, onDragStart, onDragEnd, onEdit, onDelete }: KanbanCardProps) {
    const priority = PRIORITY_CONFIG[todo.priority]
    const overdue = !todo.is_completed && isOverdue(todo.due_date)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, todo.id)}
            onDragEnd={onDragEnd}
            className={cn(
                'group relative bg-card/60 hover:bg-card/80 border border-border/30 hover:border-border/60 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all duration-150',
                isDragging && 'opacity-50 ring-2 ring-primary/30'
            )}
        >
            {/* Drag Handle + Title */}
            <div className="flex items-start gap-2">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <h4
                        className={cn(
                            'text-xs font-medium leading-snug',
                            todo.is_completed && 'line-through text-muted-foreground'
                        )}
                    >
                        {todo.title}
                    </h4>

                    {todo.description && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                            {todo.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-1.5">
                    <span
                        className={cn(
                            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium border',
                            priority.bg,
                            priority.color,
                            priority.border
                        )}
                    >
                        <Flag className="w-2 h-2" />
                        {priority.label}
                    </span>

                    {todo.due_date && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 text-[10px]',
                                overdue ? 'text-destructive' : 'text-muted-foreground'
                            )}
                        >
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDate(todo.due_date)}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(todo)}
                        className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                        title="Edit"
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => onDelete(todo.id)}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
