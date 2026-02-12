import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, LayoutList, Kanban } from 'lucide-react'
import { toast } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'
import { EmptyState } from '@/components/common/EmptyState'
import { TodoList } from '@/features/todos/components/TodoList'
import { TodoForm } from '@/features/todos/components/TodoForm'
import { TodoFilters } from '@/features/todos/components/TodoFilters'
import { TodoStats } from '@/features/todos/components/TodoStats'
import { DeleteConfirmDialog } from '@/features/todos/components/DeleteConfirmDialog'
import { KanbanBoard } from '@/features/todos/components/KanbanBoard'
import { AiSuggestionPanel } from '@/features/ai/components/AiSuggestionPanel'
import { AiSmartAdd } from '@/features/ai/components/AiSmartAdd'
import { useTodos } from '@/features/todos/hooks/useTodos'
import { useCreateTodo } from '@/features/todos/hooks/useCreateTodo'
import { useUpdateTodo } from '@/features/todos/hooks/useUpdateTodo'
import { useDeleteTodo } from '@/features/todos/hooks/useDeleteTodo'
import { useTodoRealtime } from '@/features/todos/hooks/useTodoRealtime'
import { cn } from '@/lib/utils'
import type { FilterOption, SortOption } from '@/config/constants'
import type { Todo } from '@/features/todos/types/todo.types'
import type { CreateTodoFormData } from '@/features/todos/schemas/todo.schema'

type ViewMode = 'list' | 'board'

export function DashboardPage() {
    const [filter, setFilter] = useState<FilterOption>('all')
    const [sort, setSort] = useState<SortOption>('newest')
    const [viewMode, setViewMode] = useState<ViewMode>('board')
    const [formOpen, setFormOpen] = useState(false)
    const [editTodo, setEditTodo] = useState<Todo | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null)

    const { data: todos = [], isLoading } = useTodos({ filter, sort })
    const { data: allTodos = [] } = useTodos({ filter: 'all', sort: 'newest' })
    const createTodo = useCreateTodo()
    const updateTodo = useUpdateTodo()
    const deleteTodo = useDeleteTodo()

    // Subscribe to real-time updates
    useTodoRealtime()

    const handleCreate = useCallback(
        async (data: CreateTodoFormData) => {
            try {
                await createTodo.mutateAsync({
                    title: data.title,
                    description: data.description || null,
                    priority: data.priority,
                    due_date: data.due_date || null,
                })
                setFormOpen(false)
                toast.success('Task created successfully!')
            } catch {
                toast.error('Failed to create task')
            }
        },
        [createTodo]
    )

    const handleAiCreate = useCallback(
        async (data: { title: string; description: string | null; priority: 'low' | 'medium' | 'high'; due_date: string | null }) => {
            await createTodo.mutateAsync(data)
        },
        [createTodo]
    )

    const handleUpdate = useCallback(
        async (data: CreateTodoFormData) => {
            if (!editTodo) return
            try {
                await updateTodo.mutateAsync({
                    id: editTodo.id,
                    data: {
                        title: data.title,
                        description: data.description || null,
                        priority: data.priority,
                        due_date: data.due_date || null,
                    },
                })
                setEditTodo(null)
                toast.success('Task updated!')
            } catch {
                toast.error('Failed to update task')
            }
        },
        [editTodo, updateTodo]
    )

    const handleToggle = useCallback(
        async (id: string, completed: boolean) => {
            try {
                await updateTodo.mutateAsync({
                    id,
                    data: {
                        is_completed: completed,
                        status: completed ? 'completed' : 'todo',
                    },
                })
                toast.success(completed ? 'Task completed! 🎉' : 'Task reopened')
            } catch {
                toast.error('Failed to update task')
            }
        },
        [updateTodo]
    )

    const handleStatusChange = useCallback(
        async (id: string, status: 'todo' | 'in_progress' | 'completed') => {
            try {
                await updateTodo.mutateAsync({
                    id,
                    data: {
                        status,
                        is_completed: status === 'completed',
                    },
                })
                const labels = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
                toast.success(`Moved to ${labels[status]}`)
            } catch {
                toast.error('Failed to move task')
            }
        },
        [updateTodo]
    )

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return
        try {
            await deleteTodo.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
            toast.success('Task deleted')
        } catch {
            toast.error('Failed to delete task')
        }
    }, [deleteTarget, deleteTodo])

    const handleEdit = useCallback((todo: Todo) => {
        setEditTodo(todo)
    }, [])

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Page Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold">My Tasks</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Organize, prioritize, and conquer your day
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Toggle */}
                        <div className="flex items-center glass rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'p-2 rounded-lg transition-all',
                                    viewMode === 'list'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                                title="List view"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={cn(
                                    'p-2 rounded-lg transition-all',
                                    viewMode === 'board'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                                title="Board view"
                            >
                                <Kanban className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => setFormOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-sm transition-all glow-sm hover:glow active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Task</span>
                        </button>
                    </div>
                </div>

                {/* AI Smart Add */}
                <div className="mb-5">
                    <AiSmartAdd onCreateTodo={handleAiCreate} />
                </div>

                {viewMode === 'board' ? (
                    /* Kanban Board View */
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : allTodos.length === 0 ? (
                            <EmptyState onAddTodo={() => setFormOpen(true)} />
                        ) : (
                            <KanbanBoard
                                todos={allTodos}
                                onStatusChange={handleStatusChange}
                                onEdit={handleEdit}
                                onDelete={(id) => {
                                    const todo = allTodos.find((t) => t.id === id)
                                    if (todo) setDeleteTarget(todo)
                                }}
                                onAddTodo={() => setFormOpen(true)}
                            />
                        )}

                        {/* Stats & AI below the board */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TodoStats todos={allTodos} />
                            <AiSuggestionPanel todos={allTodos} />
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                        {/* Main Content */}
                        <div className="space-y-4">
                            {/* Filters */}
                            <TodoFilters
                                filter={filter}
                                onFilterChange={setFilter}
                                sort={sort}
                                onSortChange={(s) => setSort(s as SortOption)}
                            />

                            {/* Todo List */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : todos.length === 0 ? (
                                <EmptyState onAddTodo={() => setFormOpen(true)} />
                            ) : (
                                <TodoList
                                    todos={todos}
                                    onToggle={handleToggle}
                                    onDelete={(id) => {
                                        const todo = todos.find((t) => t.id === id)
                                        if (todo) setDeleteTarget(todo)
                                    }}
                                    onEdit={handleEdit}
                                />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <TodoStats todos={allTodos} />
                            <AiSuggestionPanel todos={allTodos} />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Create/Edit Dialog */}
            <TodoForm
                isOpen={formOpen || !!editTodo}
                onClose={() => {
                    setFormOpen(false)
                    setEditTodo(null)
                }}
                onSubmit={editTodo ? handleUpdate : handleCreate}
                isSubmitting={createTodo.isPending || updateTodo.isPending}
                editTodo={editTodo}
            />

            {/* Delete Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                isDeleting={deleteTodo.isPending}
                todoTitle={deleteTarget?.title || ''}
            />
        </MainLayout>
    )
}
