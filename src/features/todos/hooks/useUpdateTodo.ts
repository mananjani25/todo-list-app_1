import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todoKeys } from '@/config/constants'
import type { Todo, UpdateTodoData } from '@/features/todos/types/todo.types'

interface UpdateTodoArgs {
    id: string
    data: UpdateTodoData
}

export function useUpdateTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: UpdateTodoArgs): Promise<Todo> => {
            const { data: todo, error } = await supabase
                .from('todos')
                .update(data as never)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return todo as Todo
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: todoKeys.all })

            const previousTodos = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all })

            queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.lists() }, (old) => {
                if (!old) return old
                return old.map((todo) =>
                    todo.id === id ? { ...todo, ...data, updated_at: new Date().toISOString() } : todo
                )
            })

            return { previousTodos }
        },
        onError: (_err, _args, context) => {
            if (context?.previousTodos) {
                for (const [queryKey, data] of context.previousTodos) {
                    queryClient.setQueryData(queryKey, data)
                }
            }
        },
        onSuccess: (updatedTodo) => {
            queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.lists() }, (old) => {
                if (!old) return old
                return old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
            })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: todoKeys.all })
        },
    })
}
