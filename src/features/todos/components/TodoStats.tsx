import { motion } from 'framer-motion'
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import type { Todo } from '@/features/todos/types/todo.types'

interface TodoStatsProps {
    todos: Todo[]
}

export function TodoStats({ todos }: TodoStatsProps) {
    const total = todos.length
    const completed = todos.filter((t) => t.is_completed).length
    const active = total - completed
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <div className="grid grid-cols-3 gap-3">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl p-3 text-center"
            >
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    <Circle className="w-3.5 h-3.5 text-info" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Total</span>
                </div>
                <p className="text-xl font-bold">{total}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl p-3 text-center"
            >
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-warning" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Active</span>
                </div>
                <p className="text-xl font-bold text-warning">{active}</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-xl p-3 text-center"
            >
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Done</span>
                </div>
                <p className="text-xl font-bold text-success">{completed}</p>
            </motion.div>

            {/* Progress bar */}
            {total > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-3 glass rounded-xl p-3"
                >
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span className="font-medium text-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    )
}
