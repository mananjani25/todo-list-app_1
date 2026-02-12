import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todoKeys } from '@/config/constants'
import type { Todo } from '@/features/todos/types/todo.types'

export function useDeleteTodo() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string): Promise<void> => {
            const { error } = await supabase.from('todos').delete().eq('id', id)
            if (error) throw error
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: todoKeys.all })

            const previousTodos = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all })

            queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.lists() }, (old) => {
                if (!old) return old
                return old.filter((todo) => todo.id !== id)
            })

            return { previousTodos }
        },
        onError: (_err, _id, context) => {
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
