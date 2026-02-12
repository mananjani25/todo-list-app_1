export const APP_NAME = 'TaskFlow'
export const APP_DESCRIPTION = 'AI-Powered Task Management'

export const todoKeys = {
    all: ['todos'] as const,
    lists: () => [...todoKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>, userId?: string) =>
        [...todoKeys.lists(), { ...filters, userId }] as const,
    details: () => [...todoKeys.all, 'detail'] as const,
    detail: (id: string) => [...todoKeys.details(), id] as const,
}

export const aiKeys = {
    all: ['ai'] as const,
    suggestions: () => [...aiKeys.all, 'suggestions'] as const,
}

export const PRIORITY_CONFIG = {
    low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
} as const

export const FILTER_OPTIONS = ['all', 'active', 'completed'] as const
export type FilterOption = (typeof FILTER_OPTIONS)[number]

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
    { value: 'due_date', label: 'Due Date' },
] as const
export type SortOption = (typeof SORT_OPTIONS)[number]['value']
