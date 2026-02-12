import { z } from 'zod'

export const createTodoSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
    description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
    priority: z.enum(['low', 'medium', 'high']),
    due_date: z.string().optional().or(z.literal('')),
})

export type CreateTodoFormData = z.infer<typeof createTodoSchema>

export const updateTodoSchema = createTodoSchema.partial().extend({
    is_completed: z.boolean().optional(),
})

export type UpdateTodoFormData = z.infer<typeof updateTodoSchema>
