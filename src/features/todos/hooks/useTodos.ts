import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todoKeys } from '@/config/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Todo } from '@/features/todos/types/todo.types'
import type { FilterOption, SortOption } from '@/config/constants'

interface UseTodosOptions {
    filter?: FilterOption
    sort?: SortOption
}

export function useTodos(options: UseTodosOptions = {}) {
    const { filter = 'all', sort = 'newest' } = options
    const { user } = useAuth()

    return useQuery({
        queryKey: todoKeys.list({ filter, sort }, user?.id),
        retry: false,
        enabled: !!user,
        queryFn: async (): Promise<Todo[]> => {
            if (!user) return []

            let query = supabase.from('todos').select('*').eq('user_id', user.id)

            if (filter === 'active') {
                query = query.eq('is_completed', false)
            } else if (filter === 'completed') {
                query = query.eq('is_completed', true)
            }

            switch (sort) {
                case 'oldest':
                    query = query.order('created_at', { ascending: true })
                    break
                case 'priority': {
                    query = query.order('created_at', { ascending: false })
                    break
                }
                case 'due_date':
                    query = query.order('due_date', { ascending: true, nullsFirst: false })
                    break
                default:
                    query = query.order('created_at', { ascending: false })
            }

            const { data, error } = await query
            if (error) throw error

            let result = data as Todo[]

            if (sort === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                result = result.sort(
                    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
                )
            }

            return result
        },
    })
}
