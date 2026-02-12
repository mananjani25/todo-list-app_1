import { useQuery } from '@tanstack/react-query'
import { aiKeys } from '@/config/constants'
import { getAiSuggestions } from '@/features/ai/services/ai.service'
import type { Todo } from '@/features/todos/types/todo.types'

export function useAiSuggestions(todos: Todo[]) {
    return useQuery({
        queryKey: [...aiKeys.suggestions(), todos.length],
        queryFn: () => getAiSuggestions(todos),
        enabled: todos.length > 0,
        staleTime: 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    })
}
