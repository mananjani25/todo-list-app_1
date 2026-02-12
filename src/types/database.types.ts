export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            todos: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    is_completed: boolean
                    status: 'todo' | 'in_progress' | 'completed'
                    priority: 'low' | 'medium' | 'high'
                    due_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    title: string
                    description?: string | null
                    is_completed?: boolean
                    status?: 'todo' | 'in_progress' | 'completed'
                    priority?: 'low' | 'medium' | 'high'
                    due_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    is_completed?: boolean
                    status?: 'todo' | 'in_progress' | 'completed'
                    priority?: 'low' | 'medium' | 'high'
                    due_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}

export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']
