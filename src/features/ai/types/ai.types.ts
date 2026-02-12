export interface AiSuggestion {
    id: string
    type: 'priority' | 'category' | 'breakdown' | 'insight'
    title: string
    description: string
    actionLabel?: string
    data?: Record<string, unknown>
}

export interface AiEnhancement {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date?: string
}

export interface AiParsedTask {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
}
