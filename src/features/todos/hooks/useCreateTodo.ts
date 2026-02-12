import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todoKeys } from '@/config/constants'
import type { Todo, CreateTodoData } from '@/features/todos/types/todo.types'
import type { InsertTables } from '@/types/database.types'

export function useCreateTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateTodoData): Promise<Todo> => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const insertData: InsertTables<'todos'> = {
                user_id: user.id,
                title: data.title,
                description: data.description || null,
                priority: data.priority || 'medium',
                due_date: data.due_date || null,
                status: 'todo',
            }
            const { data: todo, error } = await supabase
                .from('todos')
                .insert(insertData as never)
                .select()
                .single()

            if (error) throw error
            return todo as Todo
        },
        onMutate: async (newTodo) => {
            await queryClient.cancelQueries({ queryKey: todoKeys.all })

            const previousTodos = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all })

            queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.lists() }, (old) => {
                if (!old) return old
                const optimistic: Todo = {
                    id: `temp-${Date.now()}`,
                    user_id: 'temp',
                    title: newTodo.title,
                    description: newTodo.description || null,
                    is_completed: false,
                    status: 'todo',
                    priority: newTodo.priority || 'medium',
                    due_date: newTodo.due_date || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
                return [optimistic, ...old]
            })

            return { previousTodos }
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousTodos) {
                for (const [queryKey, data] of context.previousTodos) {
                    queryClient.setQueryData(queryKey, data)
                }
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: todoKeys.all })
        },
    })
}
