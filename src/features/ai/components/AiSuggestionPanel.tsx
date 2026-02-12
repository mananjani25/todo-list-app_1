import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, RefreshCw, Lightbulb, AlertCircle, Layers, TrendingUp } from 'lucide-react'
import { useAiSuggestions } from '@/features/ai/hooks/useAiSuggestions'
import type { Todo } from '@/features/todos/types/todo.types'
import { cn } from '@/lib/utils'

interface AiSuggestionPanelProps {
    todos: Todo[]
}

const typeIcons = {
    priority: AlertCircle,
    category: Layers,
    breakdown: Lightbulb,
    insight: TrendingUp,
}

const typeColors = {
    priority: 'text-red-400 bg-red-500/10',
    category: 'text-amber-400 bg-amber-500/10',
    breakdown: 'text-blue-400 bg-blue-500/10',
    insight: 'text-emerald-400 bg-emerald-500/10',
}

export function AiSuggestionPanel({ todos }: AiSuggestionPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const { data: suggestions, isLoading, refetch, isRefetching } = useAiSuggestions(todos)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl overflow-hidden"
        >
            {/* Header */}
            {/* Header */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded(!isExpanded)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setIsExpanded(!isExpanded)
                    }
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-semibold">AI Suggestions</h3>
                        <p className="text-[10px] text-muted-foreground">Smart insights for your tasks</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {suggestions && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                refetch()
                            }}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
                            title="Refresh suggestions"
                        >
                            <RefreshCw className={cn('w-3.5 h-3.5', isRefetching && 'animate-spin')} />
                        </button>
                    )}
                    <ChevronDown className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-180'
                    )} />
                </div>
            </div>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {isLoading || isRefetching ? (
                                // Loading skeletons
                                Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="bg-secondary/30 rounded-xl p-3 animate-pulse">
                                        <div className="flex items-start gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-secondary/50" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-secondary/50 rounded w-1/3" />
                                                <div className="h-2.5 bg-secondary/50 rounded w-full" />
                                                <div className="h-2.5 bg-secondary/50 rounded w-2/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : suggestions && suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => {
                                    const Icon = typeIcons[suggestion.type]
                                    const colorClass = typeColors[suggestion.type]

                                    return (
                                        <motion.div
                                            key={suggestion.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-secondary/20 rounded-xl p-3 hover:bg-secondary/30 transition-colors"
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-semibold mb-0.5">{suggestion.title}</h4>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        {suggestion.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <p className="text-xs text-muted-foreground text-center py-3">
                                    Add tasks to get AI-powered suggestions
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
