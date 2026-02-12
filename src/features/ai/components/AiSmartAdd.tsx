import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, X } from 'lucide-react'
import { parseNaturalLanguageTask } from '@/features/ai/services/ai.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AiSmartAddProps {
    onCreateTodo: (data: {
        title: string
        description: string | null
        priority: 'low' | 'medium' | 'high'
        due_date: string | null
    }) => Promise<void>
}

export function AiSmartAdd({ onCreateTodo }: AiSmartAddProps) {
    const [input, setInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current
        if (el) {
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
        }
    }, [input])

    const handleSubmit = useCallback(async () => {
        const text = input.trim()
        if (!text || isProcessing) return

        setIsProcessing(true)
        try {
            const parsedTasks = await parseNaturalLanguageTask(text)

            // Create tasks sequentially to ensure order (if significant) and avoid race conditions
            let count = 0
            for (const task of parsedTasks) {
                await onCreateTodo({
                    title: task.title,
                    description: task.description || null,
                    priority: task.priority,
                    due_date: task.due_date || null,
                })
                count++
            }

            setInput('')

            if (count > 1) {
                toast.success(`${count} tasks created!`, {
                    description: 'AI successfully parsed and added your tasks.',
                })
            } else if (count === 1) {
                toast.success('Task created!', {
                    description: `"${parsedTasks[0].title}" added to your list.`,
                })
            }
        } catch (error) {
            console.error('AI parse error:', error)
            toast.error('AI couldn\'t parse that. Try being more specific.')
        } finally {
            setIsProcessing(false)
        }
    }, [input, isProcessing, onCreateTodo])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
                'relative glass rounded-2xl transition-all duration-300',
                isFocused && 'ring-1 ring-primary/30 glow-sm'
            )}
        >
            <div className="flex items-start gap-3 px-4 py-3">
                <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 mt-0.5',
                    isProcessing
                        ? 'bg-primary/20 animate-pulse-glow'
                        : 'bg-primary/10'
                )}>
                    <Sparkles className={cn(
                        'w-4 h-4 text-primary transition-all',
                        isProcessing && 'animate-spin'
                    )} />
                </div>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder='Try: "Buy groceries tomorrow, high priority"'
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground/60 outline-none resize-none min-h-[24px] leading-6 py-0.5"
                    disabled={isProcessing}
                />

                <AnimatePresence>
                    {input.trim() && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-1 flex-shrink-0 mt-0.5"
                        >
                            <button
                                onClick={() => setInput('')}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                                {isProcessing ? 'Parsing...' : 'Add'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* AI hint */}
            <AnimatePresence>
                {isFocused && !input && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                            {['📋 Finish project report by Friday', '🏃 Exercise 30 mins daily', '📧 Reply to client emails'].map((hint) => (
                                <button
                                    key={hint}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        setInput(hint)
                                    }}
                                    className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                                >
                                    {hint}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

