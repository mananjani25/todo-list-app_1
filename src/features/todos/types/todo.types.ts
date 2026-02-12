import type { Tables } from '@/types/database.types'

export type Todo = Tables<'todos'>

export interface CreateTodoData {
    title: string
    description?: string | null
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
}

export interface UpdateTodoData {
    title?: string
    description?: string | null
    is_completed?: boolean
    status?: 'todo' | 'in_progress' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    due_date?: string | null
}
