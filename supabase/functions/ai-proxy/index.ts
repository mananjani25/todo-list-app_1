// Supabase Edge Function: AI proxy for secure Groq calls
// Deploy: supabase functions deploy ai-proxy

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
    action: 'suggestions' | 'enhance' | 'parse'
    payload: Record<string, unknown>
}

// Model Config
const MODEL_FAST = 'llama-3.3-70b-versatile' // Fast, good for JSON
const MODEL_SMART = 'llama-3.3-70b-versatile' // Using same model for consistency/speed

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        if (!GROQ_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'GROQ API key not configured on server' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { action, payload } = (await req.json()) as RequestBody
        const today = new Date().toISOString().split('T')[0]

        let messages: { role: string; content: string }[] = []
        let maxTokens = 1000
        let model = MODEL_FAST

        switch (action) {
            case 'suggestions': {
                const todos = payload.todos as any[]
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

            default:
                return new Response(
                    JSON.stringify({ error: `Unknown action: ${action}` }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
        }

        // Call Groq API
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
                response_format: { type: "json_object" } // Force JSON mode
            }),
        })

        if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            return new Response(
                JSON.stringify({ error: err?.error?.message || `Groq API error: ${response.status}` }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const data = await response.json()
        let content = data.choices?.[0]?.message?.content?.trim() || ''

        // Groq sometimes wraps response in "tasks": [] due to json_object mode if prompt isn't perfect, 
        // or just returns the object. We'll handle parsing on the client, but let's try to ensure raw content is clean.

        return new Response(
            JSON.stringify({ content }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
