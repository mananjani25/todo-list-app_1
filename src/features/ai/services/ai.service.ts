import type { AiSuggestion, AiEnhancement, AiParsedTask } from '@/features/ai/types/ai.types'
import type { Todo } from '@/features/todos/types/todo.types'
import { supabase } from '@/lib/supabase'

// Fallback: direct Groq call if Edge Function is not deployed
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

/**
 * Call AI via Supabase Edge Function (preferred) or direct Groq (fallback)
 */
async function callAI(action: string, payload: Record<string, unknown>): Promise<string> {
    // Try Edge Function first
    try {
        const { data, error } = await supabase.functions.invoke('ai-proxy', {
            body: { action, payload },
        })

        if (!error && data?.content) {
            return data.content
        }
        // If edge function fails, fall through to direct call
        console.warn('Edge Function unavailable, falling back to direct Groq call')
    } catch {
        console.warn('Edge Function invocation failed, using direct fallback')
    }

    // Fallback: direct Groq call (for local dev without deployed edge functions)
    if (!GROQ_API_KEY) {
        throw new Error('AI service not available (GROQ_API_KEY missing)')
    }

    return callGroqDirect(action, payload)
}

async function callGroqDirect(action: string, payload: Record<string, unknown>): Promise<string> {
    const today = new Date().toISOString().split('T')[0]
    let messages: OpenAIMessage[] = []
    let maxTokens = 1000
    let model = 'llama-3.3-70b-versatile'

    switch (action) {
        case 'suggestions': {
            const todos = payload.todos
            messages = [
                {
                    role: 'system',
                    content: `You are a productivity AI assistant. Analyze the user's task list and provide actionable suggestions. 
Return a valid JSON array of 2-4 suggestions. Each object must have:
- "id": unique string
- "type": one of "priority", "category", "breakdown", "insight"  
- "title": short title (max 6 words)
- "description": actionable advice (1-2 sentences, max 120 chars)

Focus on: overdue tasks, priority management, productivity patterns, task breakdown.
Today's date: ${today}.
Return ONLY valid JSON array, no markdown.`,
                },
                {
                    role: 'user',
                    content: `My tasks: ${JSON.stringify(todos)}`,
                },
            ]
            break
        }

        case 'enhance': {
            const title = payload.title as string
            messages = [
                {
                    role: 'system',
                    content: `You are a task planning assistant. Given a task title, enhance it with:
- A clearer, more actionable title (keep concise)
- A helpful description with actionable steps (2-3 sentences max)
- Suggested priority: "low", "medium", or "high"
- Suggested due date as ISO string (YYYY-MM-DD) or null if not determinable

Today's date: ${today}.
Return ONLY valid JSON with keys: title, description, priority, due_date. No markdown.`,
                },
                {
                    role: 'user',
                    content: `Enhance this task: "${title}"`,
                },
            ]
            break
        }

        case 'parse': {
            const input = payload.input as string
            messages = [
                {
                    role: 'system',
                    content: `You are a smart task parser. Extract ONE OR MORE structured tasks from natural language input.
Return a valid JSON ARRAY of task objects. Each object must have:
- "title": clear task title
- "description": specific details mentioned or implied (e.g. "Draft report" -> "Create initial draft of the weekly report")
- "priority": "low", "medium", or "high" (infer from urgency)  
- "due_date": ISO date string (YYYY-MM-DD) or null

Handle multiple tasks if the user asks for them (e.g. "Task A then Task B").
If dependencies are implied, sequence the due dates logicially.
Today's date: ${today}.
Interpret relative dates (tomorrow, next week, friday, etc.) relative to today.
Return ONLY valid JSON ARRAY, no markdown.`,
                },
                {
                    role: 'user',
                    content: input,
                },
            ]
            break
        }
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: model,
            messages,
            max_tokens: maxTokens,
            temperature: 0.5,
            response_format: { type: "json_object" }
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * Get AI-powered suggestions based on current todos
 */
export async function getAiSuggestions(todos: Todo[]): Promise<AiSuggestion[]> {
    if (todos.length === 0) {
        return getFallbackSuggestions(todos)
    }

    try {
        const todosContext = todos.map((t) => ({
            title: t.title,
            description: t.description,
            priority: t.priority,
            completed: t.is_completed,
            due_date: t.due_date,
        }))

        const content = await callAI('suggestions', { todos: todosContext })

        // Handle Groq potentially wrapping in object or returning just array
        let parsed = JSON.parse(content)
        if (parsed.suggestions) parsed = parsed.suggestions
        if (!Array.isArray(parsed) && typeof parsed === 'object') {
            // Try to find array value if wrapped manually
            const values = Object.values(parsed)
            const arrayVal = values.find(Array.isArray)
            if (arrayVal) parsed = arrayVal
        }

        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 4) as AiSuggestion[]
        }
        return getFallbackSuggestions(todos)
    } catch (error) {
        console.warn('AI suggestions failed, using fallback:', error)
        return getFallbackSuggestions(todos)
    }
}

/**
 * AI-enhance a task: generate better description, suggest priority and due date
 */
export async function enhanceTask(title: string): Promise<AiEnhancement> {
    const content = await callAI('enhance', { title })
    return JSON.parse(content) as AiEnhancement
}

/**
 * Parse natural language into structured task(s)
 */
export async function parseNaturalLanguageTask(input: string): Promise<AiParsedTask[]> {
    const content = await callAI('parse', { input })
    let parsed = JSON.parse(content)

    // Handle Groq potentially wrapping in object key "tasks" due to json_object mode
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
        return parsed.tasks
    }

    // If it returns a single object instead of array
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
        // Create single item array
        return [parsed as AiParsedTask]
    }

    return parsed as AiParsedTask[]
}

// Fallback suggestions when AI is unavailable
function getFallbackSuggestions(todos: Todo[]): AiSuggestion[] {
    const suggestions: AiSuggestion[] = []
    const active = todos.filter((t) => !t.is_completed)
    const completed = todos.filter((t) => t.is_completed)

    if (todos.length > 0) {
        const rate = Math.round((completed.length / todos.length) * 100)
        suggestions.push({
            id: 'insight-1',
            type: 'insight',
            title: 'Productivity Insight',
            description: rate >= 70
                ? `Great work! ${rate}% tasks completed. Keep it up!`
                : `${rate}% completion rate. Try tackling quick wins first.`,
        })
    }

    const highPriority = active.filter((t) => t.priority === 'high')
    if (highPriority.length > 0) {
        suggestions.push({
            id: 'priority-1',
            type: 'priority',
            title: 'High Priority Pending',
            description: `${highPriority.length} high-priority task${highPriority.length > 1 ? 's' : ''} need attention. Focus on "${highPriority[0].title}" first.`,
        })
    }

    const overdue = active.filter((t) => t.due_date && new Date(t.due_date) < new Date())
    if (overdue.length > 0) {
        suggestions.push({
            id: 'overdue-1',
            type: 'category',
            title: 'Overdue Tasks',
            description: `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} past due. Consider rescheduling.`,
        })
    }

    if (suggestions.length === 0) {
        suggestions.push({
            id: 'tip-1',
            type: 'insight',
            title: 'Getting Started',
            description: 'Add tasks to get AI-powered productivity suggestions!',
        })
    }

    return suggestions
}
