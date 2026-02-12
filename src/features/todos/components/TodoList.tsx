import { AnimatePresence } from 'framer-motion'
import { TodoItem } from '@/features/todos/components/TodoItem'
import type { Todo } from '@/features/todos/types/todo.types'

interface TodoListProps {
    todos: Todo[]
    onToggle: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
    onEdit: (todo: Todo) => void
}

export function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
    return (
        <div className="space-y-2">
            <AnimatePresence mode="popLayout">
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
