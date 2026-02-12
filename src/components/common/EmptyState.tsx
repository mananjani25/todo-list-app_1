import { motion } from 'framer-motion'
import { ClipboardList, Plus } from 'lucide-react'

interface EmptyStateProps {
    onAddTodo: () => void
}

export function EmptyState({ onAddTodo }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-16"
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6"
            >
                <ClipboardList className="w-10 h-10 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                Start organizing your day by creating your first task. Stay productive and on track!
            </p>
            <button
                onClick={onAddTodo}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm transition-all glow-sm hover:glow"
            >
                <Plus className="w-4 h-4" />
                Create your first task
            </button>
        </motion.div>
    )
}
