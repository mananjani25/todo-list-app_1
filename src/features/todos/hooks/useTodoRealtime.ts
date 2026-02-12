import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { todoKeys } from '@/config/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function useTodoRealtime() {
    const queryClient = useQueryClient()
    const { user } = useAuth()

    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel('todos-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'todos',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: todoKeys.all })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [queryClient, user])
}

